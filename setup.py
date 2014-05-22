import os
import subprocess
import sys

from setuptools import setup


__version__ = '0.1'


def make_version():
    version = [__version__]
    try:
        version.extend(['.dev', os.environ['BUILD_NUMBER']])
    except KeyError:
        pass
    try:
        version.extend(['.r', subprocess.check_output(
            ['git', 'rev-parse', '--short', 'HEAD']).decode('utf-8').strip()])
    except (FileNotFoundError, subprocess.CalledProcessError):
        pass
    return ''.join(version)


setup(
    name = 'openeis-ui',
    version = make_version(),
    description = 'Open Energy Information System (OpenEIS) API client.',
    author = 'Bora Akyol',
    author_email = 'bora@pnnl.gov',
    url = 'http://www.pnnl.gov',
    packages = ['openeis.ui'],
    package_data = {
        'openeis.ui': ['static/openeis-ui/' + name for name in
                       ['index.html', 'settings.js', 'general_definition.json',
                        'sensormap-schema.json', 'units.json',
                        'css/app.css', 'js/app.min.js']],
    },
    zip_safe = False,
)
