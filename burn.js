var fs = require("fs");
var http = require("http");
var path = require('path');
var bufferConcat = require('buffer-concat');

function burn(burnKey, file) {
  //var file = "/Users/marty/esp8266_arduino/build/webduino_dvlp_OLED2.ino.hex";
  //var burnKey = "AWoN";
  var uuid = Math.floor((1 + Math.random()) * 0x10000000).toString(16);

  var data = fs.readFileSync(file),
    client, request;

  console.log("Arduino File:", path.basename(file));

  var crlf = "\r\n",
    boundary = '---------------------------10102754414578508781458777923', // Boundary: "--" + up to 70 ASCII chars + "\r\n"
    delimiter = crlf + "--" + boundary,
    headers = [
      'Content-Disposition: form-data; name="file"; filename="' + uuid + "_" + path.basename(file) + '"' + crlf,
      'Content-Type: arduino/hex' + crlf,
    ],
    closeDelimiter = delimiter + "--",
    multipartBody;

  multipartBody = Buffer.concat([
    new Buffer(delimiter + crlf + headers.join('') + crlf),
    data,
    new Buffer(closeDelimiter)
  ]);
  //client = http.createClient(80, "localhost");
  //request = client.request('POST', '/upload/firmware', {
  request = http.request({
    'host': "webduino.tw",
    'port': 80,
    'path': '/upload/firmware',
    'method': 'POST',
    'headers': {
      'Burn-Key': burnKey,
      'Burn-Server': 'r.webduino.io',
      'Board-Type': "mark1",
      'User-Agent': 'upload',
      'Accept-Encoding': 'gzip,deflate',
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': multipartBody.length
    }
  });

  request.write(multipartBody);
  request.end();

  request.on('error', function (err) {
    console.log(err);
  });

  request.on('response', function (response) {
    console.log('response');

    response.setEncoding('utf8');

    response.on('data', function (chunk) {
      console.log(chunk.toString());
    });

    response.on('end', function () {
      console.log("end");
    });
  });
}

document.getElementById("mark1").addEventListener("click", function () {
  var deviceId = (document.getElementById("deviceId").value + "").trim();
  var filePath = (document.getElementById("filePath").value + "").trim();
  if (fs.existsSync(filePath)) {
    alert('燒錄準備開始，請查看開發板燈號...');
    burn(deviceId, filePath);
  } else {
    alert('韌體檔案不存在，請檢查檔案路徑...');
  }
});
//