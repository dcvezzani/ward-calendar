let moment = require('moment');

let calendar = JSON.parse(process.argv[2]);
let date = null;
let entries = [];

for (item of calendar) {

  if (item.class === 'agenda-date-bar') {
    date = item.text // first column, agenda-time

  } else if (item.class === 'agenda-header') {
    let time = item.children[0].children[1].text // first column, agenda-time
    let description = item.children[1].children[1].text // second column, agenda-name
    entries.push ({date: date, time: time, description: description});
  }
}
// console.log(JSON.stringify(entries));

const { exec } = require('child_process');
exec("echo \"" + JSON.stringify(entries).replace(/\"/g, '\\"') + "\" | jq '. | group_by(.date) | map(.[0].date as $date | {dateString: $date, date: ($date | strptime(\"\%A - \%B \%d, \%Y\") | strftime(\"\%Y-\%m-\%d\") ), events: map({time: .time, description: .description})}) | sort_by(.date)' ", (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    console.error(['err', err]);
    return;
  }

  // the *entire* stdout and stderr (buffered)
  // console.log(`stdout: ${stdout}`);
  // console.log(`stderr: ${stderr}`);

  let days = JSON.parse(stdout);
  let time = null;

  for ( day of days ) {
    console.log(`\n${day.dateString}`);
    for ( event of day.events ) {
      time = (event.time === null) ? 'All Day' : event.time;
      console.log(`  - ${time}: ${event.description.replace(/&#39;/g, "'")}`);
    }
  }

});

/*

json=$(cat ~/Downloads/agenda-list.html | pup '#agendaList json{}' --color --indent 2 | jq '.[0].children | map(select(.class != "agenda-text"))') && node ./index.js "$json" | jq '. | group_by(.date) | map(.[0].date as $date | {dateString: $date, date: ($date | strptime("%A - %B %d, %Y") | strftime("%Y-%m-%d") ), events: map({time: .time, description: .description})}) | sort_by(.date)'

 */

