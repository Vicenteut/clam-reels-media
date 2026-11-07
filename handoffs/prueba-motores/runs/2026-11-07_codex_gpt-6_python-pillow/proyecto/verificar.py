#!/usr/bin/env python3
"""Validate this run's final media without depending on the caller's cwd.

Run after both renders have finished: python proyecto/verificar.py
Requires NumPy, ffmpeg and ffprobe. Missing V2 is reported as pending.
Writes only evidencia/validacion.json inside this run. Exit: 0 pass, 1 fail,
2 pending. Technical checks do not replace mobile/visual evaluation.
"""
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from fractions import Fraction

ROOT = Path(__file__).resolve().parents[1]
INPUT_NAMES = ("voz.wav", "tiempos.json", "guion.txt")
LOCAL_KIT = ROOT / "materiales" / "entradas"
KIT = LOCAL_KIT if all((LOCAL_KIT / name).is_file() for name in INPUT_NAMES) else ROOT.parent.parent / "kit"
EVIDENCE = ROOT / "evidencia"
FPS = 30
TARGET_SECONDS = 13.75
VIDEO_TOLERANCE = 1 / FPS
EXPECTED_FRAMES = 413
CHECKS = []


def check(name, passed=None, **details):
    item = {"check": name, "status": "pending" if passed is None else "pass" if passed else "fail"}
    item.update(details)
    CHECKS.append(item)
    return item


def sha256(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def command(args, timeout=120):
    result = subprocess.run(args, capture_output=True, timeout=timeout)
    if result.returncode:
        raise RuntimeError(result.stderr.decode("utf-8", errors="replace")[-2000:] or "command failed")
    return result.stdout


def probe(path, count_frames=False):
    args = ["ffprobe", "-v", "error"]
    if count_frames:
        args += ["-count_frames"]
    args += ["-show_streams", "-show_format", "-of", "json", str(path)]
    return json.loads(command(args))


def number(value):
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def near(value, expected, tolerance):
    return value is not None and abs(value - expected) <= tolerance + 1e-7


def integer(value):
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def ratio(value):
    try:
        return float(Fraction(value))
    except (ValueError, TypeError, ZeroDivisionError):
        return None


def pcm(path, np):
    raw = command(["ffmpeg", "-v", "error", "-i", str(path), "-map", "0:a:0",
                   "-vn", "-ac", "1", "-ar", "48000", "-f", "f32le", "-"])
    return np.frombuffer(raw, dtype="<f4").astype(np.float64)


def signal_stats(reference, decoded, np, max_lag=4800):
    n = min(len(reference), len(decoded))
    if n < 32:
        raise ValueError("insufficient audio samples")
    x = reference[:n]
    y = decoded[:n]
    x = x - x.mean()
    y = y - y.mean()
    xx = float(np.dot(x, x))
    yy = float(np.dot(y, y))
    if xx < 1e-12 or yy < 1e-12:
        raise ValueError("silent signal cannot establish correlation")
    xy = float(np.dot(x, y))
    corr = xy / math.sqrt(xx * yy)
    gain = xy / xx
    rms_db = 10 * math.log10(yy / xx)
    size = 1 << ((2 * n - 1).bit_length())
    cross = np.fft.irfft(np.fft.rfft(y, size) * np.conj(np.fft.rfft(x, size)), size)
    bound = min(max_lag, n // 4)
    lags = np.arange(-bound, bound + 1)
    best_lag = int(lags[int(np.argmax(cross[lags % size]))])
    error = float(np.dot(y - x, y - x))
    return {
        "samples_compared": n,
        "zero_lag_pearson": round(corr, 9),
        "estimated_linear_gain": round(gain, 9),
        "rms_difference_db": round(rms_db, 6),
        "best_lag_samples": best_lag,
        "best_lag_seconds": best_lag / 48000,
        "snr_db": round(10 * math.log10(xx / max(error, 1e-30)), 6),
    }


def audio_comparison(path, reference, np):
    decoded = pcm(path, np)
    metrics = signal_stats(reference, decoded, np)
    metrics["reference_samples"] = len(reference)
    metrics["decoded_samples"] = len(decoded)
    metrics["extra_decoded_samples"] = len(decoded) - len(reference)
    metrics["aac_padding_note"] = (
        "AAC decoding can expose trailing codec-frame padding. Compare the complete "
        "source duration; ffprobe separately verifies the container's intended duration."
    )
    segments = []
    # Distributed windows reveal local offsets or drift instead of relying only on
    # a whole-file correlation dominated by one loud passage.
    for start_s in (0.0, 3.0, 6.0, 9.0, 11.75):
        lo = round(start_s * 48000)
        hi = min(round((start_s + 2.0) * 48000), len(reference), len(decoded))
        segment = signal_stats(reference[lo:hi], decoded[lo:hi], np)
        segment.update({"start_seconds": start_s, "end_seconds": hi / 48000})
        segments.append(segment)
    metrics["segments"] = segments
    metrics["interpretation"] = (
        "High correlation, unit gain and zero local lag support unchanged timing and "
        "level within the thresholds below; AAC is lossy, so binary equality is not expected."
    )
    return metrics


def verify_kit():
    hashes = {}
    repository = next((parent for parent in ROOT.parents if (parent / ".git").exists()), None)
    manifest_path = EVIDENCE / "entradas_originales.json"
    manifest = read_json(manifest_path) if manifest_path.exists() else {}
    reference_files = manifest.get("files", {})
    reference_commit = manifest.get("repository_commit")
    for name in INPUT_NAMES:
        path = KIT / name
        if not path.exists():
            check(f"kit/{name}:exists", False, path=str(path))
            continue
        value = sha256(path)
        hashes[name] = value
        expected_manifest = reference_files.get(name, {}).get("sha256")
        if repository is not None and shutil.which("git"):
            try:
                # Use the pinned source commit when distributed; later commits can
                # add the run without changing which kit was originally used.
                ref = reference_commit or "HEAD"
                baseline = command(["git", "-C", str(repository), "show",
                                    f"{ref}:handoffs/prueba-motores/kit/{name}"])
                expected = hashlib.sha256(baseline).hexdigest()
                check(f"kit/{name}:unchanged", value == expected,
                      sha256=value, baseline_sha256=expected,
                      reference_source="git", repository_commit=ref,
                      used_path=str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path))
                if expected_manifest:
                    check(f"kit/{name}:distributed_reference_matches_git",
                          expected_manifest == expected, manifest_sha256=expected_manifest,
                          git_sha256=expected)
            except Exception as exc:
                if expected_manifest:
                    check(f"kit/{name}:unchanged", value == expected_manifest,
                          sha256=value, baseline_sha256=expected_manifest,
                          reference_source="manifest", repository_commit=reference_commit,
                          git_unavailable_reason=str(exc))
                else:
                    check(f"kit/{name}:unchanged", None, sha256=value,
                          reason=f"Git reference unavailable and no distributed hash: {exc}")
        elif expected_manifest:
            check(f"kit/{name}:unchanged", value == expected_manifest,
                  sha256=value, baseline_sha256=expected_manifest,
                  reference_source="manifest", repository_commit=reference_commit,
                  note="Compared with the distributed reference; Git was not consulted in this copy.")
        else:
            check(f"kit/{name}:unchanged", None, sha256=value,
                  reason="Neither repository metadata nor distributed reference hashes are available.")
    return hashes


def verify_media(version, source_audio, np):
    path = ROOT / f"final_{version}.mp4"
    if not path.exists():
        check(f"{version}:media_exists", None, reason="MP4 not delivered yet.")
        return None
    before = (path.stat().st_size, path.stat().st_mtime_ns)
    data = probe(path, count_frames=True)
    videos = [s for s in data["streams"] if s.get("codec_type") == "video"]
    audios = [s for s in data["streams"] if s.get("codec_type") == "audio"]
    check(f"{version}:stream_count", len(videos) == 1 and len(audios) == 1,
          video_streams=len(videos), audio_streams=len(audios))
    if not videos or not audios:
        return {"ffprobe": data}
    v, a = videos[0], audios[0]
    check(f"{version}:resolution", (v.get("width"), v.get("height")) == (1080, 1920),
          actual=[v.get("width"), v.get("height")], expected=[1080, 1920])
    check(f"{version}:video_codec", v.get("codec_name") == "h264", actual=v.get("codec_name"))
    check(f"{version}:pixel_format", v.get("pix_fmt") == "yuv420p", actual=v.get("pix_fmt"))
    check(f"{version}:audio_codec", a.get("codec_name") == "aac", actual=a.get("codec_name"))
    check(f"{version}:fps", near(ratio(v.get("avg_frame_rate")), FPS, 1e-9)
          and near(ratio(v.get("r_frame_rate")), FPS, 1e-9),
          average=v.get("avg_frame_rate"), nominal=v.get("r_frame_rate"))
    check(f"{version}:decoded_frame_count", integer(v.get("nb_read_frames")) == EXPECTED_FRAMES,
          decoded=integer(v.get("nb_read_frames")), declared=integer(v.get("nb_frames")),
          expected=EXPECTED_FRAMES)
    for label, duration in (("container_duration", data.get("format", {}).get("duration")),
                            ("video_duration", v.get("duration"))):
        check(f"{version}:{label}", near(number(duration), TARGET_SECONDS, VIDEO_TOLERANCE),
              actual_seconds=number(duration), target_seconds=TARGET_SECONDS,
              tolerance_seconds=VIDEO_TOLERANCE)
    check(f"{version}:audio_duration", near(number(a.get("duration")), TARGET_SECONDS, 1 / 48000),
          actual_seconds=number(a.get("duration")), target_seconds=TARGET_SECONDS,
          tolerance_seconds=1 / 48000)
    check(f"{version}:audio_format", a.get("sample_rate") == "48000" and a.get("channels") == 1,
          sample_rate=a.get("sample_rate"), channels=a.get("channels"))
    check(f"{version}:audio_start", near(number(a.get("start_time")), 0, 1 / 48000),
          actual_seconds=number(a.get("start_time")))
    metrics = None
    if source_audio is not None and np is not None:
        metrics = audio_comparison(path, source_audio, np)
        check(f"{version}:audio_complete", metrics["decoded_samples"] >= metrics["reference_samples"],
              reference_samples=metrics["reference_samples"], decoded_samples=metrics["decoded_samples"])
        check(f"{version}:audio_correlation", metrics["zero_lag_pearson"] >= 0.985,
              actual=metrics["zero_lag_pearson"], minimum=0.985)
        check(f"{version}:audio_gain", abs(metrics["estimated_linear_gain"] - 1) <= 0.02
              and abs(metrics["rms_difference_db"]) <= 0.2,
              estimated_linear_gain=metrics["estimated_linear_gain"],
              rms_difference_db=metrics["rms_difference_db"],
              allowed_gain=[0.98, 1.02], allowed_rms_db=[-0.2, 0.2])
        lags = [metrics["best_lag_samples"]] + [s["best_lag_samples"] for s in metrics["segments"]]
        correlations = [s["zero_lag_pearson"] for s in metrics["segments"]]
        check(f"{version}:audio_local_timing", all(abs(x) <= 1 for x in lags)
              and min(correlations) >= 0.98,
              best_lags_samples=lags, minimum_segment_correlation=min(correlations),
              allowed_lag_samples=1)
    else:
        check(f"{version}:audio_comparison", None, reason="Source audio or NumPy unavailable.")
    after = (path.stat().st_size, path.stat().st_mtime_ns)
    check(f"{version}:file_stable_during_validation", before == after,
          before=list(before), after=list(after))
    return {"path": path.name, "sha256": sha256(path), "ffprobe": data, "audio": metrics}


def verify_provenance(media, kit_hashes):
    manifests = {}
    source = ROOT / "proyecto" / "render.py"
    current_source_hash = sha256(source) if source.exists() else None
    configs = {}
    for version in ("v1", "v2"):
        cfg = ROOT / "proyecto" / f"config_{version}.json"
        if cfg.exists():
            configs[version] = read_json(cfg)
        else:
            check(f"{version}:config_exists", None, reason="Configuration not created yet.")
        manifest_path = EVIDENCE / f"render_{version}.json"
        if not manifest_path.exists():
            check(f"{version}:render_manifest_exists", None, reason="Render manifest not created yet.")
            continue
        manifest = read_json(manifest_path)
        manifests[version] = manifest
        check(f"{version}:manifest_source_matches_current", manifest.get("source_sha256") == current_source_hash,
              manifest_sha256=manifest.get("source_sha256"), current_sha256=current_source_hash)
        check(f"{version}:manifest_audio_matches_kit", manifest.get("audio_sha256") == kit_hashes.get("voz.wav"),
              manifest_sha256=manifest.get("audio_sha256"), kit_sha256=kit_hashes.get("voz.wav"))
        if media.get(version):
            check(f"{version}:manifest_mp4_matches_file", manifest.get("mp4_sha256") == media[version].get("sha256"),
                  manifest_sha256=manifest.get("mp4_sha256"), actual_sha256=media[version].get("sha256"))
        if version in configs:
            check(f"{version}:manifest_config_matches_file", manifest.get("config") == configs[version])
    if "v1" in configs and "v2" in configs:
        c1, c2 = configs["v1"], configs["v2"]
        d1, d2 = c1.get("box_delay_frames"), c2.get("box_delay_frames")
        check("e5:box_delay_exactly_15_frames", isinstance(d1, (int, float))
              and isinstance(d2, (int, float)) and d2 - d1 == 15,
              v1=d1, v2=d2, expected_difference=15)
        check("e5:cable_route", c1.get("cable_route") == "direct" and c2.get("cable_route") == "wall",
              v1=c1.get("cable_route"), v2=c2.get("cable_route"))
        check("e5:inverter_label", c1.get("inverter_label") == "INVERTER"
              and c2.get("inverter_label") == "INVERTER · DC → AC",
              v1=c1.get("inverter_label"), v2=c2.get("inverter_label"))
    else:
        check("e5:config_changes", None, reason="Both configurations are required.")
    if "v1" in manifests and "v2" in manifests:
        m1, m2 = manifests["v1"], manifests["v2"]
        check("e5:same_render_source", m1.get("source_sha256") == m2.get("source_sha256"),
              v1=m1.get("source_sha256"), v2=m2.get("source_sha256"))
        a1 = {a["event"]: a["frame"] for a in m1.get("anchors", [])}
        a2 = {a["event"]: a["frame"] for a in m2.get("anchors", [])}
        for event, expected in (("box", 15), ("connect", 15), ("materialize", 0)):
            difference = a2[event] - a1[event] if event in a1 and event in a2 else None
            check(f"e5:declared_{event}_frame_delta", difference == expected,
                  v1=a1.get(event), v2=a2.get(event), expected_difference=expected,
                  note="Manifest timing, not a visual event detector.")
    else:
        check("e5:render_source_comparison", None, reason="Both render manifests are required.")
    frozen_path = EVIDENCE / "congelado_v1.json"
    frozen = None
    if frozen_path.exists():
        frozen = read_json(frozen_path)
        expected = (frozen.get("mp4_sha256") or frozen.get("final_v1_sha256") or frozen.get("sha256"))
        actual = (media.get("v1") or {}).get("sha256")
        check("v1:frozen_hash_unchanged", bool(expected) and expected == actual,
              frozen_sha256=expected, actual_sha256=actual)
        if frozen.get("source_sha256") and "v1" in manifests:
            check("v1:frozen_source_matches_render", frozen["source_sha256"] == manifests["v1"].get("source_sha256"),
                  frozen_sha256=frozen["source_sha256"], render_sha256=manifests["v1"].get("source_sha256"))
    else:
        check("v1:frozen_hash_unchanged", None, reason="congelado_v1.json not created yet.")
    return {"current_source_sha256": current_source_hash, "configs": configs,
            "manifests": manifests, "frozen_v1": frozen}


def main():
    report = {
        "schema_version": 1,
        "validated_at_utc": datetime.now(timezone.utc).isoformat(),
        "run": ROOT.name,
        "input_directory": str(KIT),
        "limitations": [
            "Run only after rendering finishes; file stability is also checked during inspection.",
            "AAC content is assessed numerically with declared tolerances, not claimed lossless.",
            "Anchor manifests/configuration do not replace frame-by-frame visual validation.",
            "Legibility, visual quality and human comprehension remain evaluator tasks.",
        ],
    }
    dependencies = {name: shutil.which(name) for name in ("ffmpeg", "ffprobe")}
    for name, path in dependencies.items():
        check(f"dependency:{name}", path is not None, executable=path)
    np = None
    try:
        import numpy as np
        report["numpy_version"] = np.__version__
    except ImportError:
        check("dependency:numpy", False, reason="Install the project's NumPy dependency before validation.")
    try:
        report["kit_sha256"] = verify_kit()
    except Exception as exc:
        report["kit_sha256"] = {}
        check("kit:validation_error", False, reason=str(exc))
    reference = None
    source_path = KIT / "voz.wav"
    if dependencies["ffmpeg"] and dependencies["ffprobe"] and source_path.exists():
        try:
            report["source_audio_ffprobe"] = probe(source_path)
            if np is not None:
                reference = pcm(source_path, np)
                check("kit:source_audio_samples", len(reference) == round(TARGET_SECONDS * 48000),
                      actual_samples=len(reference), expected_samples=round(TARGET_SECONDS * 48000))
        except Exception as exc:
            check("kit:source_audio_error", False, reason=str(exc))
    media = {}
    if all(dependencies.values()):
        for version in ("v1", "v2"):
            try:
                media[version] = verify_media(version, reference, np)
            except Exception as exc:
                media[version] = None
                check(f"{version}:validation_error", False, reason=str(exc))
    report["media"] = media
    try:
        report["provenance"] = verify_provenance(media, report["kit_sha256"])
    except Exception as exc:
        check("provenance:validation_error", False, reason=str(exc))
    report["checks"] = CHECKS
    counts = {status: sum(c["status"] == status for c in CHECKS) for status in ("pass", "fail", "pending")}
    report["counts"] = counts
    report["status"] = "fail" if counts["fail"] else "pending" if counts["pending"] else "pass"
    EVIDENCE.mkdir(exist_ok=True)
    destination = EVIDENCE / "validacion.json"
    temporary = destination.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(destination)
    print(f"Validation {report['status'].upper()}: {counts['pass']} pass, {counts['fail']} fail, {counts['pending']} pending")
    for item in CHECKS:
        if item["status"] != "pass":
            print(f"  {item['status'].upper()}: {item['check']} — {item.get('reason', 'see JSON details')}")
    for version, result in media.items():
        if result and result.get("audio"):
            audio = result["audio"]
            print(f"  {version}: correlation={audio['zero_lag_pearson']}, gain={audio['estimated_linear_gain']}, lag={audio['best_lag_samples']} samples")
    print(f"Evidence: {destination}")
    return 1 if counts["fail"] else 2 if counts["pending"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
