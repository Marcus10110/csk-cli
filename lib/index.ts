import CliBox from 'cli-box';
import Couleurs from 'couleurs';
import { http } from 'follow-redirects';

const Clrs = Couleurs();
const color_legend = {
  bg_color: '#11181F',
  clouds: [
    Clrs.fg('■', '#FBFBFB'),
    Clrs.fg('■', '#EAEAEA'),
    Clrs.fg('■', '#C2C2C2'),
    Clrs.fg('■', '#AEEEEE'),
    Clrs.fg('■', '#9ADADA'),
    Clrs.fg('■', '#77B7F7'),
    Clrs.fg('■', '#63A3E3'),
    Clrs.fg('■', '#4F8FCF'),
    Clrs.fg('■', '#2767A7'),
    Clrs.fg('■', '#135393'),
    Clrs.fg('■', '#003F7F'),
  ],
  transparency: [
    Clrs.fg('■', '#F9F9F9'),
    Clrs.fg('■', '#C7C7C7'),
    Clrs.fg('■', '#95D5D5'),
    Clrs.fg('■', '#63A3E3'),
    Clrs.fg('■', '#2C6CAC'),
    Clrs.fg('■', '#003F7F'),
  ],
  seeing: [
    Clrs.fg('■', '#F9F9F9'),
    Clrs.fg('■', '#C7C7C7'),
    Clrs.fg('■', '#95D5D5'),
    Clrs.fg('■', '#63A3E3'),
    Clrs.fg('■', '#2C6CAC'),
    Clrs.fg('■', '#003F7F'),
  ],
  wind: [
    Clrs.fg('■', '#F9F9F9'),
    Clrs.fg('■', '#C7C7C7'),
    Clrs.fg('■', '#95D5D5'),
    Clrs.fg('■', '#63A3E3'),
    Clrs.fg('■', '#2C6CAC'),
    Clrs.fg('■', '#003F7F'),
  ],
  humidity: [
    Clrs.fg('■', '#08035D'),
    Clrs.fg('■', '#0D4D8D'),
    Clrs.fg('■', '#3070B0'),
    Clrs.fg('■', '#4E8ECE'),
    Clrs.fg('■', '#71B1F1'),
    Clrs.fg('■', '#80C0C0'),
    Clrs.fg('■', '#09FEED'),
    Clrs.fg('■', '#55FAAD'),
    Clrs.fg('■', '#94FE6A'),
    Clrs.fg('■', '#EAFB16'),
    Clrs.fg('■', '#FEC600'),
    Clrs.fg('■', '#FC8602'),
    Clrs.fg('■', '#FE3401'),
    Clrs.fg('■', '#EA0000'),
    Clrs.fg('■', '#B70000'),
    Clrs.fg('■', '#E10000'),
  ],
  temperature: [
    Clrs.fg('■', '#FC00FC'),
    Clrs.fg('■', '#000085'),
    Clrs.fg('■', '#0000B2'),
    Clrs.fg('■', '#0000EC'),
    Clrs.fg('■', '#0034FE'),
    Clrs.fg('■', '#0089FE'),
    Clrs.fg('■', '#00D4FE'),
    Clrs.fg('■', '#1EFEDE'),
    Clrs.fg('■', '#FBFBFB'),
    Clrs.fg('■', '#5EFE9E'),
    Clrs.fg('■', '#A2FE5A'),
    Clrs.fg('■', '#FEDE00'),
    Clrs.fg('■', '#FE9E00'),
    Clrs.fg('■', '#FE5A00'),
    Clrs.fg('■', '#FE1E00'),
    Clrs.fg('■', '#E20000'),
    Clrs.fg('■', '#A90000'),
    Clrs.fg('■', '#7E0000'),
    Clrs.fg('■', '#C6C6C6'),
  ],
};

interface ParseResult {
  title: string;
  conditions: { time: string, clouds: number, transparency: number, seeing: number, wind: number, humidity: number, temperature: number }[];
}

const parseData = (text: string): ParseResult => {
  const title = /title(\s*)=(\s*)\"(.*)\"/g.exec(text)[3];
  var sky_arr = text.match(/"(.*)",\s(\d*),\t(\d*),\t(\d*),\t(\d*),\t(\d*),\t(\d*),\t/g);
  const conditions = [];
  for (var i = 0; i < sky_arr.length; i++) {
    var sky_nodes = sky_arr[i].replace(/\s/g, '').split(',');
    var stripped_hour = sky_nodes[0].split(':')[0];
    conditions.push({
      time: stripped_hour.substr(stripped_hour.length - 2, stripped_hour.length),
      clouds: Number(sky_nodes[1]),
      transparency: Number(sky_nodes[2]),
      seeing: Number(sky_nodes[3]),
      wind: Number(sky_nodes[4]),
      humidity: Number(sky_nodes[5]),
      temperature: Number(sky_nodes[6]),
    });
  }
  return { title, conditions };
};

const downloadData = function (key: string, callback: (result: string | null) => void) {
  var str = '';
  http.get('http://cleardarksky.com/txtc/' + key + 'csp.txt', function (res) {
    res.on('error', function (e) {
      callback(null);
    });
    res.on('data', function (chunk) {
      str += chunk;
    });
    res.on('end', function () {
      callback(str);
    });
  });
};

const buildChart = function (data: string, callback: (err: Error, result: string) => void) {
  let built = '';
  if (data === null) callback(Error('Error downloading chart data!'), null);
  const parsedData = parseData(data);
  var title = parsedData.title + ' Clear Sky Chart';
  built += new Array(52 - Math.floor(title.length / 2)).join('=');
  built += title;
  built += new Array(104 - built.length).join('=') + '\n';
  built += new Array(104).join('-') + '\n';
  for (var x = 1; x < 3; x++) {
    built += '------------- ';
    for (var j = 0; j < parsedData.conditions.length; j++) {
      built += parsedData.conditions[j].time.substr(x - 1, x);
      built += ' ';
    }
    built += '\n';
  }
  built += 'Cloud Cover:  ';
  for (var i = 0; i < parsedData.conditions.length; i++) built += color_legend.clouds[parsedData.conditions[i].clouds] + ' ';
  built += '\n';
  built += 'Transparency: ';
  for (var i = 0; i < parsedData.conditions.length; i++)
    built += color_legend.transparency[parsedData.conditions[i].transparency] + ' ';
  built += '\n';
  built += 'Seeing:       ';
  for (var i = 0; i < parsedData.conditions.length; i++) built += color_legend.seeing[parsedData.conditions[i].seeing] + ' ';
  built += '\n' + new Array(104).join(Clrs.fg(' ', color_legend.bg_color)) + '\n';
  built += 'Wind:         ';
  for (var i = 0; i < parsedData.conditions.length; i++) built += color_legend.wind[parsedData.conditions[i].wind] + ' ';
  built += '\n';
  built += 'Humidity:     ';
  for (var i = 0; i < parsedData.conditions.length; i++)
    built += color_legend.humidity[parsedData.conditions[i].humidity] + ' ';
  built += '\n';
  built += 'Temperature:  ';
  for (var i = 0; i < parsedData.conditions.length; i++)
    built += color_legend.temperature[parsedData.conditions[i].temperature] + ' ';
  built = built.split('\n').map(function (i) {
    return Clrs.bg(i, color_legend.bg_color);
  }).join('\n');
  built = new CliBox(
    {
      w: 106,
      h: 11,
      marks: {
        nw: '╔',
        n: '═',
        ne: '╗',
        e: '║',
        se: '╝',
        s: '═',
        sw: '╚',
        w: '║',
        b: ' ',
      },
    },
    {
      text: built,
      stretch: true,
      hAlign: 'left',
    },
  ).toString();
  callback(null, built);
};

export const generateChart = (key: string, callback: (err: Error, result: string) => void) => {
  if (key.indexOf('key', key.length - 3) !== -1) key = key.substr(0, key.length - 3);
  downloadData(key, function (res) {
    buildChart(res, callback);
  });
};
