#!/usr/bin/env node
import * as fs from 'fs';
import * as Csk from '../lib';
import { http as Http } from 'follow-redirects';
import * as path from 'path';
import * as Yn from 'yesno';
import * as readLine from 'readline';

var chart_key = '';
var key_array: string[] = [];

var rli = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getKeyLocation() {
  return process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] + '/.csk_key';
}

function write_key(value: string) {
  Yn.ask('Set this chart as the default? (y,N)', false, function (ok) {
    if (ok)
      fs.writeFile(getKeyLocation(), value, function (err) {
        if (err) return console.log('Error saving to ' + getKeyLocation());
      });
    chart_key = value;
    console.log('\n');
    generate_csk();
  });
}

function find_chart_key(query: string | null) {
  if (query === null || query === '') {
    rli.question('Search for a Clear Sky Chart: ', find_chart_key);
    return;
  }
  var matches: string[] = [];
  for (var i = 0; i < key_array.length - 1; i++)
    if (key_array[i].split('|')[2].indexOf(query) > -1) {
      matches.push(key_array[i]);
    }
  if (matches.length <= 0) {
    console.log('Unable to find a match for ' + query);
    find_chart_key(null);
    return;
  }
  for (var i = 0; i < matches.length; i++) {
    console.log(i + ': ' + matches[i].split('|')[2]);
  }
  console.log('b: Back');
  rli.question('Enter your choice here: ', function (data) {
    if (data === 'b') return find_chart_key(null);
    if (data === '' || Number(data) >= matches.length) return find_chart_key(query);
    write_key(matches[Number(data)].split('|')[0]);
  });
}

function download_chart_keys() {
  var str = '';
  console.log('Enumerating charts...');
  Http.get('http://cleardarksky.com/t/chart_prop00.txt', function (res) {
    res.on('error', function (e) {
      console.log('Error downloading CSK keys: ' + e.message);
      process.exit(1);
    });
    res.on('data', function (chunk) {
      str += chunk;
    });
    res.on('end', function () {
      key_array = str.split('\n');
      find_chart_key(null);
    });
  });
}

function generate_csk() {
  if (chart_key == '') return download_chart_keys();
  Csk.generateChart(chart_key, function (err, result) {
    console.log(err || result);
    process.exit(0);
  });
}

function print_help(name: string) {
  console.log(path.basename(name) + ': CLI Interface to ClearDarkSky.com');
  console.log('Options:');
  console.log('  --search     - Preforms an interactive chart search');
  console.log('  --help       - Print this help output');
  process.exit(0);
}

if (process.argv[2] == '--search') generate_csk();
else if (process.argv[2] == '--help') print_help(process.argv[1]);
else {
  fs.readFile(getKeyLocation(), 'utf-8', function (err, data) {
    if (err) {
      console.log('Error reading CSK key!\nPlease select one manually!');
      return generate_csk();
    }
    chart_key = data;
    generate_csk();
  });
}
