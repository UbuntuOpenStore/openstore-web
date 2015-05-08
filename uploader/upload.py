#!/bin/env python2

import argparse
from os.path import basename
from smartfile import BasicClient

parser = argparse.ArgumentParser(description='Uploader for openappstore')
parser.add_argument('filepath', nargs='?')
args = parser.parse_args()

if not args.filepath:
    raise Exception('No file path specified')

filename = basename(args.filepath)
file = file(args.filepath, 'rb')

api = BasicClient()
response = api.post('/path/data/openappstore/v1/', file=file)

print(response)
print('https://file.ac/w-fprv1yrTM/' + filename)
