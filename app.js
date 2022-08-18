const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const app = express();
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(__dirname, 'upload', file.originalname);
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath);
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    })
});

app.use('/public', express.static('public'));
app.use('/upload', express.static('upload'));

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/upload',
    upload.fields([{ name: 'uploadFiles', maxCount: 1 }]),
    (req, res, next) => {
        const filePath = req.files.uploadFiles[0].path;
        const filename = req.files.uploadFiles[0].filename;
        const destination = req.files.uploadFiles[0].destination;
        const result = {
            filePath: filePath.replace(__dirname, '').replace(/\\/g, '/'),
            filename,
            destination: destination.replace(__dirname, '').replace(/\\/g, '/'),
            thumbnails: [],
            duration: 0
        };
        
        // 영상 재생 시간 얻어야함

        ffmpeg
            .ffprobe(filePath, (err, data) => {
                if (err) {
                    // TODO::에러 처리
                    console.error(err);
                    return;
                }

                // 동영상 길이 데이터가 없는 경우
                if (isNaN(data.format.duration)) {
                    // TODO::duration 삽입 작업 필요
                    console.log('duration 삽입 작업 필요');
                    return;
                }

                result.duration = data.format.duration;
            });

        // 썸네일 10장 추출
        ffmpeg(filePath)
            .on('end', () => {
                res.json(result);
            })
            .on('filenames', (filenames) => {
                filenames.forEach((filename, i) => {
                    const second = path.basename(filename, path.extname(filename)).split('-thumbnail-')[1];
                    result.thumbnails.push({ filename, second });
                });
            })
            .on('error', (err) => {
                // TODO::에러 처리
                console.log('An error occurred: ' + err.message);
            })
            .screenshots({
                // count: 10,
                timestamps: ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%'],
                filename: '%b-thumbnail-%s.jpg',
                folder: path.join(__dirname, 'upload', filename),
                size: '10%'
            });
    }
);

app.listen(3000, () => console.log('Server listening on port 3000'));