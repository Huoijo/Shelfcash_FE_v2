"""Guard target and disable live/background side effects before pytest/status."""
import json
import os
from pathlib import Path
import subprocess
import sys
from sqlalchemy import text
from sqlalchemy.engine import make_url
from app.config import Settings
from app.infrastructure.database.engine import create_database_engine
from scripts.dev import validate_reset_target

root = Path(__file__).resolve().parent
url = json.loads((root / 'private/database.json').read_text())['url']
parsed = make_url(url)
assert (parsed.host, parsed.port, parsed.database, parsed.username) == ('127.0.0.1', 5442, 'shelfcash_integration_test', 'shelfcash_integration_tester')
os.environ.update(CHAT_LLM_ENABLED='false', SUMMARY_LLM_ENABLED='false', CHAT_API_KEY='', SUMMARY_API_KEY='', PYTHONUNBUFFERED='1', DATABASE_URL=url, TEST_DATABASE_URL=url, ENVIRONMENT='test',
    AUTH_EMAIL_DELIVERY_ENABLED='false', IMPORT_LLM_SUGGESTIONS_ENABLED='false',
    IMPORT_WORKER_ENABLED='false', PLANNING_WORKER_ENABLED='false',
    PDF_EXPORT_WORKER_ENABLED='false', NOTIFICATION_WORKER_ENABLED='false',
    OPENROUTER_API_KEY='', AUTH_SMTP_PASSWORD='')
settings = Settings()
validate_reset_target(settings)
import app
assert Path(app.__file__).resolve().is_relative_to(Path.cwd().resolve()), 'Wrong source checkout'
engine = create_database_engine(settings)
with engine.connect() as connection:
    identity = connection.execute(text('SELECT current_database(), current_user, rolsuper, rolcreatedb, rolcreaterole, rolbypassrls FROM pg_roles WHERE rolname=current_user')).one()
    assert tuple(identity) == ('shelfcash_integration_test', 'shelfcash_integration_tester', False, False, False, False)
    assert connection.scalar(text('SELECT count(*) FROM pg_stat_activity WHERE datname=current_database() AND pid<>pg_backend_pid()')) == 0
engine.dispose()
print('Recovery handoff guarded target and limited role verified; live providers/background workers OFF', flush=True)
raise SystemExit(subprocess.call([sys.executable, '-B', *sys.argv[1:]]))
