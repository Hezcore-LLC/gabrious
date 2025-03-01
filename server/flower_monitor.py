from celery import Celery
import subprocess
import sys

app = Celery('gabrious')
app.config_from_object('celery_app')

if __name__ == '__main__':
    # Run flower as a separate process
    cmd = [sys.executable, '-m', 'flower', '--port', '5555', '--broker', 'redis://localhost:6379/0']
    subprocess.run(cmd)