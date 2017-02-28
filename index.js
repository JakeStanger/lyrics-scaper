var request = require("request")

//const BANDS = ["pinkfloyd", "yes", "kingcrimson"];
const BANDS = ["pinkfloyd"];
const URL = "http://www.azlyrics.com";

var songs = {};

function getSongsFromHTML(html)
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
    pages = getFromBetween.get(albumData, '<a href="..', '" target="_blank">')
    console.log(title)
    console.log(pages)
  }

  console.log(albums);
}

function getSongs(band)
{
  request(URL + "/" + band.charAt(0) + "/" + band + ".html", function (error, response, body)
  {
    if (!error)
    {
        getSongsFromHTML(body);
    }
    else console.log(error);
  });
}

for(band in BANDS) getSongs(BANDS[band]);



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
