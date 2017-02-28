var request = require("request");
var fs = require("fs");
var sleep = require("sleep");

const BANDS = ["pinkfloyd", "yes", "kingcrimson"];
//const BANDS = ["pinkfloyd"];
const URL = "http://www.azlyrics.com";

var songs = {};

function putLyrics(lyrics, song, album, artist, callback)
{
  //Create objects if they do not exist
  if(!songs[artist]) songs[artist] = {};
  if(!songs[artist][album]) songs[artist][album] = {};

  songs[artist][album][song] = lyrics;
  console.log(`Added ${song}`)

  callback()
}

function getLyrics(link, song, album, artist, callback)
{
  sleep.msleep(500); //To avoid DOS trigger
  var lyrics = "";

  request(URL + link, function (error, response, body)
  {
    if (!error)
    {
      if(!body.includes('503 Service Temporarily Unavailable'))
      {
      lyrics = body.split("<div>")[1].split("</div>")[0];
        putLyrics(lyrics.replace("<!-- Usage of azlyrics.com content by any third-party lyrics provider is prohibited by our licensing agreement. Sorry about that. -->", "")
                        .replaceAll("<br>", "")
                        .replaceAll("<b>", "**").replaceAll("</b>", "**")
                        .replaceAll("<i>", "*").replaceAll("</i>", "*")
                        .replaceAll("&quot;", '"'), song, album, artist, callback);
      }
      else console.log(`Omitting ${song} (${link})`)
    }
    else console.log(error);
  });
}

function getSongsFromHTML(html, band, callback)
{
  //Get list of songs
  html = html.split('<div id="listAlbum">')[1];
  html = html.split('<script type="text/javascript">')[0];

  albums = html.split('<div class="album">');
  albums.shift(); //Remove ID tag

  for(album in albums)
  {
    albumData = albums[album];
    title = getFromBetween.get(albumData, '<b>"', '"</b>');
    songNames = getFromBetween.get(albumData, 'target="_blank">', "</a>");
    pages = getFromBetween.get(albumData, '<a href="..', '" target="_blank">');

    for(page in pages)
    {
      getLyrics(pages[page], songNames[page], title, band, callback)
      //sleep.msleep(500); //To avoid DOS trigger
    }
  }
}

function getSongs(band)
{
  request(URL + "/" + band.charAt(0) + "/" + band + ".html", function (error, response, body)
  {
    if (!error)
    {
      getSongsFromHTML(body, band, function()
      {
        var json = JSON.stringify(songs, null, 2);
        fs.writeFile(`${band}.json`, json, function(err)
        {
          if(err) return console.log(err);
        });
      });
    }
    else console.log(error);
  });
}

function go()
{
  for(band in BANDS) getSongs(BANDS[band]);
}
//getLyrics("/lyrics/genesis/suppersready.html", "Supper's Ready", "Foxtrot", "Genesis", function(){
  //console.log(songs)
//});

go();

var getFromBetween = {
    results:[],
    string:"",
    getFromBetween:function (sub1,sub2) {
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var SP = this.string.indexOf(sub1)+sub1.length;
        var string1 = this.string.substr(0,SP);
        var string2 = this.string.substr(SP);
        var TP = string1.length + string2.indexOf(sub2);
        return this.string.substring(SP,TP);
    },
    removeFromBetween:function (sub1,sub2) {
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var removal = sub1+this.getFromBetween(sub1,sub2)+sub2;
        this.string = this.string.replace(removal,"");
    },
    getAllResults:function (sub1,sub2) {
        // first check to see if we do have both substrings
        if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;

        // find one result
        var result = this.getFromBetween(sub1,sub2);
        // push it to the results array
        this.results.push(result);
        // remove the most recently found one from the string
        this.removeFromBetween(sub1,sub2);

        // if there's more substrings
        if(this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
            this.getAllResults(sub1,sub2);
        }
        else return;
    },
    get:function (string,sub1,sub2) {
        this.results = [];
        this.string = string;
        this.getAllResults(sub1,sub2);
        return this.results;
    }
};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
