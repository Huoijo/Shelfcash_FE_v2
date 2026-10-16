"""Read-only ZIP verifier; Python standard library, no engine imports or execution."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import zipfile


def verify(archive, source_root=None):
    with zipfile.ZipFile(archive) as z:
        names = z.namelist()
        assert len(names) == len(set(names)), 'Duplicate ZIP entries'
        for name in names:
            p = PurePosixPath(name)
            assert not p.is_absolute() and '..' not in p.parts and '\\' not in name and ':' not in name, name
            assert not any(part in {'.git', '.venv', 'node_modules', '__pycache__'} for part in p.parts), name
            assert not p.name.startswith('.env') and p.suffix.lower() not in {'.zip', '.pem', '.key', '.pfx', '.p12', '.db', '.sqlite', '.sqlite3'}, name
            assert not ((z.getinfo(name).external_attr >> 16) & 0o170000) == 0o120000, 'Symlink entry'
        assert z.testzip() is None, 'CRC failure'
        manifest = json.loads(z.read('MANIFEST_SHA256.json'))
        records = manifest['files']
        assert set(names) == set(records) | {'MANIFEST_SHA256.json'}, 'Manifest file-set mismatch'
        source_count = 0
        for name, record in records.items():
            payload = z.read(name)
            assert len(payload) == record['bytes'], name
            assert hashlib.sha256(payload).hexdigest() == record['sha256'], name
            if source_root is not None and record.get('source_relative_path'):
                relative = record['source_relative_path']
                candidate = (Path(source_root) / relative).resolve()
                assert candidate.is_relative_to(Path(source_root).resolve()), relative
                assert candidate.is_file() and hashlib.sha256(candidate.read_bytes()).hexdigest() == record['sha256'], 'Source mismatch: ' + relative
                source_count += 1
        return {'status': 'PASS', 'crc': 'PASS', 'safe_paths': 'PASS', 'manifest_payloads': len(records),
                'source_correspondence_files': source_count, 'source_correspondence': 'PASS' if source_root is not None else 'NOT_REQUESTED',
                'archive_sha256': hashlib.sha256(Path(archive).read_bytes()).hexdigest(), 'archive_bytes': Path(archive).stat().st_size}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('archive', type=Path)
    parser.add_argument('--source-root', type=Path)
    args = parser.parse_args()
    print(json.dumps(verify(args.archive, args.source_root), indent=2))
