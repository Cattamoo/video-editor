{
    document.addEventListener('DOMContentLoaded', () => {
        const fileElement = document.querySelector('#file');

        fileElement.addEventListener('change', (e) => {
            const formData = new FormData();
            formData.append('uploadFiles', fileElement.files[0]);
            formData.append('key', 'value');

            fetch('/upload',
                {
                    method: 'post',
                    body: formData
                })
                .then((res) => res.json())
                .then((result) => {
                    console.log(result)
                    const { filename, filePath, thumbnails, destination, duration } = result;

                    // 파일명
                    document.querySelector('#file-name').innerHTML = filename;

                    // 비디오 렌더링
                    const videoElement = document.createElement('video');
                    videoElement.id = 'video';
                    videoElement.controls = true;
                    videoElement.src = filePath;
                    videoElement.addEventListener('timeupdate', (e) => {
                        const seekBar = document.querySelector('#seekBar');
                        seekBar.value = e.currentTarget.currentTime;
                    });
                    videoElement.addEventListener('loadeddata', () => {
                        // 썸네일 렌더링
                        document.querySelector('#thumbnailArea').innerHTML = '';
                        document.querySelector('#timelineArea').innerHTML = '';
                        let start = 0;
                        let end = 0;
                        thumbnails.forEach((thumbnail, i) => {
                            const imgElement = document.createElement('img');
                            imgElement.src = destination + '/' + thumbnail.filename;
                            imgElement.addEventListener('click', () => {
                                console.log(`비디오 재생 시간 변경 ${videoElement.currentTime} --> ${thumbnail.second}`)
                                const video = document.querySelector('#video');
                                const seekBar = document.querySelector('#seekBar');
                                video.currentTime = thumbnail.second;
                                seekBar.value = thumbnail.second;
                            });
                            document.querySelector('#thumbnailArea').insertAdjacentElement('beforeend', imgElement);

                            start = parseFloat(thumbnail.second).toFixed(2);
                            end = parseFloat(thumbnails[i + 1] ? thumbnails[i + 1].second : videoElement.duration).toFixed(2);
                            const spanElement = document.createElement('span');
                            spanElement.textContent = 'test';
                            spanElement.style.width = `${videoElement.videoWidth / 10}px`;
                            spanElement.textContent = `${start}초 ~ ${end}초`;
                            document.querySelector('#timelineArea').insertAdjacentElement('beforeend', spanElement);
                        });

                        // 시크바 렌더링
                        document.querySelector('#seekBarArea').innerHTML = '';
                        const seekBarElement = document.createElement('input');
                        seekBarElement.id = 'seekBar';
                        seekBarElement.type = 'range';
                        seekBarElement.value = '0';
                        seekBarElement.min = '0';
                        seekBarElement.max = duration;
                        seekBarElement.step = '0.1';
                        seekBarElement.style.width = `${videoElement.videoWidth}px`;
                        seekBarElement.addEventListener('input', (e) => {
                            console.log(e.currentTarget.value)
                            videoElement.currentTime = e.currentTarget.value;
                        });
                        document.querySelector('#seekBarArea').insertAdjacentElement('beforeend', seekBarElement);
                    });
                    document.querySelector('#videoArea').innerHTML = '';
                    document.querySelector('#videoArea').insertAdjacentElement('beforeend', videoElement);
                })
                .catch(console.error);
        });

        // 파일선택버튼클릭
        document.querySelector('#file-select').addEventListener('click', () => document.querySelector('#file').click());
    });
}
