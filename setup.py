import os
import sys

from setuptools import setup


__version__ = '0.0'


def make_version():
    build_num = os.environ.get('BUILD_NUMBER', '')
    hash_num = ''
    try:
        file = open('.git/HEAD')
    except FileNotFoundError:
        pass
    else:
        with file:
            for line in file:
                if line.startswith('ref:'):
                    ref = line[4:].strip()
                    try:
                        hash_num = open('.git/' + ref).read()
                    except FileNotFoundError:
                        pass
                    break
    version = __version__
    if build_num:
        version += 'dev' + build_num
    if hash_num:
        version += '+' + hash_num[:10]
    return version


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
                       ['index.html', 'css/app.css', 'js/app.min.js']],
    },
    zip_safe = False,
)
