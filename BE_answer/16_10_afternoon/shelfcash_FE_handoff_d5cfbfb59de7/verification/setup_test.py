"""Disposable recovery handoff PostgreSQL instance; private credentials never printed."""
import json
from pathlib import Path
import secrets
import subprocess
from sqlalchemy.engine import URL
from app.config import Settings
from scripts.dev import validate_reset_target

root = Path(__file__).resolve().parent
private = root / 'private'
private.mkdir(parents=True, exist_ok=True)
assert not (private / 'database.json').exists(), 'Retain existing setup'
password = secrets.token_hex(24)
url = URL.create('postgresql+psycopg', username='shelfcash_integration_tester', password=password,
                 host='127.0.0.1', port=5442, database='shelfcash_integration_test').render_as_string(hide_password=False)
validate_reset_target(Settings(_env_file=None, environment='test', database_url=url))
(private / 'database.json').write_text(json.dumps({'url': url}))
(private / 'compose.env').write_text('POSTGRES_PASSWORD=' + secrets.token_hex(32) + '\n')
compose = root / 'compose.yaml'
compose.write_text('''services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "127.0.0.1:5442:5432"
    volumes:
      - recovery-handoff-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 2s
      timeout: 3s
      retries: 20
volumes:
  recovery-handoff-data:
''')
command = ['docker', 'compose', '--project-name', 'shelfcash-recovery-handoff', '--env-file', str(private / 'compose.env'), '-f', str(compose)]
subprocess.run([*command, 'up', '-d', '--wait'], check=True, capture_output=True, timeout=60)
container = subprocess.check_output([*command, 'ps', '-q', 'postgres'], text=True).strip()
sql = f'''CREATE ROLE shelfcash_integration_tester LOGIN PASSWORD '{password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE DATABASE shelfcash_integration_test OWNER shelfcash_integration_tester;
REVOKE CONNECT ON DATABASE postgres FROM PUBLIC;
REVOKE CONNECT ON DATABASE template1 FROM PUBLIC;
REVOKE CONNECT ON DATABASE shelfcash_integration_test FROM PUBLIC;
GRANT CONNECT ON DATABASE shelfcash_integration_test TO shelfcash_integration_tester;
'''
subprocess.run(['docker', 'exec', '-i', container, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres'], input=sql, text=True, capture_output=True, check=True)
print('Dedicated recovery handoff test instance created: loopback5442 / shelfcash_integration_test / limited shelfcash_integration_tester')
