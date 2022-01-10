const app = require('express')();
const server = require('http').Server(app);
const fs = require('fs');
require('dotenv').config()
const axios = require('axios');
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
const cors = require('cors')

app.use(cors());

io.on('connection', (socket) => {
    // Сохраняем файлы И отправляем инфу в тг
    socket.on('save', (winner, id, steps) => {
        const file_path = `./src/History/${id}.json`;
        const info = {
          winner,
          id,
          steps,
          data: new Date()
        }
        const SendTG = {
          'Победитель': winner,
          'ID игры': id,
          'Ходов': steps
        }
        // Отправляем в TG
        axios.get(`https://api.telegram.org/bot${process.env.REACT_APP_TG_TOKEN}/sendMessage?chat_id=${process.env.REACT_APP_TG_ID}&text=`+encodeURI(JSON.stringify(SendTG)));
        // Созадем файл
        writeFile(file_path, info)

        async function writeFile(filename, writedata) {
            try {
              await fs.promises.writeFile(filename, JSON.stringify(writedata, null, 4), 'utf8');
            } catch (err) {
              console.log(err)
            }
          }
    });
    
    // Получаем все файлы из папки и выводим в админ панель
    socket.on('getFile', async () => {
        fs.readdir(__dirname+'/src/History/', async (err, files) => {
          let filesCount = files.length;
          var count = 0;
          let stack = [];
          files.forEach(file => {
            fs.readFile(__dirname+`/src/History/${file}`, 'utf8', async function (err,data) {
              if (err) {
                return console.log(err);
              }

              count = count + 1;
              stack.push(JSON.parse(data));

              if(count >= filesCount){
                socket.emit('getFiles', stack)
              }
            });
          });
      });
    });


});

server.listen(8000, () => {
  console.log('listening on *:8000');
});