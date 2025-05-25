/*
Edpuzzle Answers Script - Integrated Version
A bookmarklet for fetching Edpuzzle answers and automated video control

ading2210/edpuzzle-answers - A bookmarklet for fetching Edpuzzle answers
Copyright (C) 2024 ading2210

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// === 全局变量 ===
let popup = null; // 在后续代码中会被重新赋值

// === 内联 CSS 样式 ===
const popupCSS = `
:root {
  --background: #282a36;
  --current-line: #44475a;
  --foreground: #f8f8f2;
  --comment: #6272a4;
  --cyan: #8be9fd;
  --green: #50fa7b;
  --orange: #ffb86c;
  --pink: #ff79c6;
  --purple: #bd93f9;
  --red: #ff5555;
  --yellow: #f1fa8c;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', sans-serif;
  background-color: var(--background);
  color: var(--foreground);
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  align-items: center;
}

p, label, button, select {
  font-size: 12px;
}
footer p {
  font-size: 11px;
}

.container {
  max-width: 800px;
  margin: 8px;
  padding: 0;
}

header {
  background-color: var(--current-line);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 10px;
}

.thumbnail {
  width: 160px;
  height: auto;
  border-radius: 5px;
}

.video-info h1 {
  font-size: 20px;
  color: var(--foreground);
  margin-bottom: 6px;
}

.video-info p {
  margin-bottom: 5px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

button, select {
  background-color: var(--comment);
  color: var(--foreground);
  border: none;
  padding: 4px 7px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: 'Poppins', sans-serif;
}

button:hover, select:hover {
  background-color: var(--background);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.speed-control, .custom-speed, .pause-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

#custom_speed {
  width: 100%;
  max-width: 200px;
}

main {
  background-color: var(--current-line);
  border-radius: 10px;
  padding: 10px;
}

.info {
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--cyan);
  font-weight: bold;
}

.questions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question {
  background-color: var(--background);
  border-radius: 5px;
  padding: 10px;
}

.timestamp_div {
  width: 45px
}

.choices {
  list-style-type: none;
}

.choices li {
  margin-bottom: 5px;
  padding: 5px;
  border-radius: 3px;
}

.choice-correct {
  color: var(--green) !important;
  font-weight: bold;
}

footer {
  margin-top: 20px;
  font-size: 12px;
  text-align: center;
}

footer p {
  margin-bottom: 10px;
}

a {
  color: var(--yellow);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
`;

// === 统一的 HTTP 请求处理函数 ===
function http_get(url, callback, headers=[], method="GET", content=null) {
  const request = new XMLHttpRequest();
  request.addEventListener("load", callback);
  request.open(method, url, true);

  if (window.__EDPUZZLE_DATA__?.token) {
    headers.push(["authorization", window.__EDPUZZLE_DATA__.token]);
  }
  for (const header of headers) {
    request.setRequestHeader(header[0], header[1]);
  }
  
  request.send(content);
}

// === 初始化和主要功能 ===
function init() {
  if (window.location.hostname == "edpuzzle.hs.vc") {
    alert("To use this, drag this button into your bookmarks bar. Then, run it when you're on an Edpuzzle assignment.");
  }
  else if ((/https{0,1}:\/\/edpuzzle.com\/assignments\/[a-f0-9]{1,30}\/watch/).test(window.location.href)) {
    getAssignment();
  }
  else if (window.canvasReadyState) {
    handleCanvasURL();
  }
  else if (window.schoologyMoreLess) {
    handleSchoologyURL();
  }
  else {
    alert("Please run this script on an Edpuzzle assignment. For reference, the URL should look like this:\nhttps://edpuzzle.com/assignments/{ASSIGNMENT_ID}/watch");
  }
}

function handleCanvasURL() {
  const location_split = window.location.href.split("/");
  const url = `/api/v1/courses/${location_split[4]}/assignments/${location_split[6]}`;
  http_get(url, function(){
    const data = JSON.parse(this.responseText);
    const url2 = data.url;

    http_get(url2, function() {
      const data = JSON.parse(this.responseText);
      const url3 = data.url;

      alert(`Please re-run this script in the newly opened tab. If nothing happens, then allow popups on Canvas and try again.`);
      open(url3);
    });
  });
}

function handleSchoologyURL() {
  const assignment_id = window.location.href.split("/")[4];
  const url = `/external_tool/${assignment_id}/launch/iframe`;
  http_get(url, function() {
    alert(`Please re-run this script in the newly opened tab. If nothing happens, then allow popups on Schoology and try again.`);

    //strip js tags from response and add to dom
    const html = this.responseText.replace(/<script[\s\S]+?<\/script>/, ""); 
    const div = document.createElement("div");
    div.innerHTML = html;
    const form = div.querySelector("form");
    
    const input = document.createElement("input")
    input.setAttribute("type", "hidden");
    input.setAttribute("name", "ext_submit");
    input.setAttribute("value", "Submit");
    form.append(input);
    document.body.append(div);

    //submit form in new tab
    form.setAttribute("target", "_blank");
    form.submit();
    div.remove();
  });
}

function getAssignment(callback) {
  const assignment_id = window.location.href.split("/")[4];
  if (typeof assignment_id == "undefined") {
    alert("Error: Could not infer the assignment ID. Are you on the correct URL?");
    return;
  }
  const url1 = "https://edpuzzle.com/api/v3/assignments/"+assignment_id;

  http_get(url1, function(){
    const assignment = JSON.parse(this.responseText);
    if ((""+this.status)[0] == "2") {
      openPopup(assignment);
    }
    else {
      alert(`Error: Status code ${this.status} recieved when attempting to fetch the assignment data.`)
    }
  });
}

function openPopup(assignment) {
  const media = assignment.medias[0];
  const teacher_assignment = assignment.teacherAssignments[0];
  const assigned_date = new Date(teacher_assignment.preferences.startDate);
  const date = new Date(media.createdAt);
  let thumbnail = media.thumbnailURL;
  if (thumbnail.startsWith("/")) {
    thumbnail = "https://"+window.location.hostname+thumbnail;
  }
  
  let deadline_text;
  if (teacher_assignment.preferences.dueDate == "") {
    deadline_text = "no due date"
  }
  else {
    deadline_text = "due on "+(new Date(teacher_assignment.preferences.dueDate)).toDateString();
  }
  
  const base_html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>${popupCSS}</style>
  <title>Answers for: ${media.title}</title>
  <script>
    // 视频选项功能 - 在弹窗中直接执行
    var unfocus_checkbox = null;
    var js_text = \`
window.addEventListener("visibilitychange", function(event) {
  console.log(document.visability_change)
  if (document.visability_change) {
    event.stopImmediatePropagation();
  }
}, true);
\`;

    function toggle_unfocus() {
      if (typeof opener.document.visability_change == "undefined") {
        opener.document.visability_change = unfocus_checkbox.checked;
        var script = opener.document.createElement("script");
        script.innerHTML = js_text;
        opener.document.body.appendChild(script);
      }
      opener.document.visability_change = unfocus_checkbox.checked;
    }
    
    // 视频速度控制功能
    var speed_dropdown = null;
    var custom_speed = null;
    var custom_speed_label = null;

    function video_speed() {
      var media_source = document.assignment.medias[0].source;
      var speed = parseFloat(speed_dropdown.value);

      //update the dropdown/slider
      if (speed == -1) {
        custom_speed.hidden = false;
        custom_speed_label.hidden = false;
        speed = parseFloat(custom_speed.value);

        if (media_source == "edpuzzle") {
          custom_speed.min = 0.1;
          custom_speed.max = 16;
          custom_speed.step = 0.1;
          custom_speed_label.innerHTML = "Speed: "+speed.toFixed(1);
        }
        else if (media_source == "youtube" || media_source == "vimeo") {
          custom_speed.min = 0.25;
          custom_speed.max = 2;
          custom_speed.step = 0.05;
          custom_speed_label.innerHTML = "Speed: "+speed.toFixed(2);
        }
      }
      else {
        custom_speed.hidden = true;
        custom_speed_label.hidden = true;
      }

      //force changing the video speed
      if (media_source == "edpuzzle") {
        var video = opener.document.querySelector("video");
        Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "playbackRate").set.call(video, speed);
        try {
          Object.defineProperty(video, "playbackRate", {writable: false});
        }
        catch (e) {}
      }
      
      else if (media_source == "youtube") {
        var iframe = opener.document.querySelector("iframe");
        
        if (iframe.id == null) {
          alert("Error: Could not find the Youtube iframe.");
          return;
        }
      
        var player = opener.YT.get(iframe.id);
        var events;
        //search for attribute that stores yt event listeners
        for (var key in player) {
          var item = player[key];
          if (item +"" != "[object Object]") continue;
          for (var key_2 in item) {
            var item_2 = item[key_2];
            
            if (Array.isArray(item_2) && typeof item_2[1] == "string" && item_2[1].startsWith("on")) {
              events = item[key_2];
              break;
            }
          }
          if (events) break;
        }
        
        for (var i=1; i<events.length; i+=3) {
          var event = events[i];
          if (event == "onPlaybackRateChange") {
            //overwrite event listener with a blank function
            events[i+1] = function(){};
          }
        }
        player.setPlaybackRate(speed)
      }

      else if (media_source == "vimeo") {
        var iframe = opener.document.querySelector("iframe");
        var player = new opener.Vimeo.Player(iframe); 
        player.off("playbackratechange");
        player.setPlaybackRate(speed);
      }
      
      else {
        alert("Error: Unrecognized video source.");
      }
    }

    // Skip Video 功能
    function skip_video() {
      var button = document.getElementById("skipper");
      button.disabled = true; 
      button.value = "Getting CSRF token...";

      function httpGet(url, callback, headers=[], method="GET", content=null) {
        var request = new XMLHttpRequest();
        request.addEventListener("load", callback);
        request.open(method, url, true);
        if (document.edpuzzle_data && document.edpuzzle_data.token) {
          headers.push(["authorization", document.edpuzzle_data.token]);
        }
        for (var header of headers) {
          request.setRequestHeader(header[0], header[1]);
        }
        request.send(content);
      }

      function getCSRF() {
        var csrfURL = "https://edpuzzle.com/api/v3/csrf";
        httpGet(csrfURL, function(){
          var data = JSON.parse(this.responseText);
          var csrf = data.CSRFToken;
          button.value = "Getting assignment data..."
          getAssignment(csrf);
        });
      }

      function getAssignment(csrf) {
        var assignment_id = opener.location.href.split("/")[4];
        var url1 = "https://edpuzzle.com/api/v3/assignments/" + assignment_id + "/attempt";
        httpGet(url1, function(){
          var data = JSON.parse(this.responseText);
          button.value = "Posting watchtime data...";
          postAttempt(csrf, data);
        });
      }

      function postAttempt(csrf, data) {
        var id = data._id;
        var teacher_assignment_id = data.teacherAssignmentId;
        var referrer = "https://edpuzzle.com/assignments/"+ teacher_assignment_id +"/watch";;
        var url2 = "https://edpuzzle.com/api/v4/media_attempts/" + id + "/watch";

        var content = {"timeIntervalNumber": 10};
        var headers = [
          ['accept', 'application/json, text/plain, */*'],
          ['accept_language', 'en-US,en;q=0.9'],
          ['content-type', 'application/json'],
          ['x-csrf-token', csrf],
          ['x-edpuzzle-referrer', referrer],
          ['x-edpuzzle-web-version', opener.__EDPUZZLE_DATA__.version]
        ];
        
        httpGet(url2, function(){
          button.value = "Video skipped successfully.";
          opener.location.reload();
        }, headers, "POST", JSON.stringify(content));
      }

      getCSRF();
    }

    // 自动答题功能类
    function EdpuzzleAutoanswer() {
      this.button = document.getElementById("answers_button");
      this.csrf = null;
      this.assignment = document.assignment;
      this.questions = document.questions;
    }

    EdpuzzleAutoanswer.prototype.init = function() {
      this.button.value = "Getting CSRF token...";
      this.getCSRF();
    };

    EdpuzzleAutoanswer.prototype.getCSRF = function() {
      var csrfURL = "https://edpuzzle.com/api/v3/csrf";
      var self = this;
      this.httpGet(csrfURL, function(response) {
        self.csrf = JSON.parse(response).CSRFToken;
        self.button.value = "Getting attempt...";
        self.getAttempt();
      });
    };

    EdpuzzleAutoanswer.prototype.getAttempt = function() {
      var id = this.assignment.teacherAssignments[0]._id;
      var attemptURL = "https://edpuzzle.com/api/v3/assignments/" + id + "/attempt";
      var self = this;
      this.httpGet(attemptURL, function(response) {
        var data = JSON.parse(response);
        self.button.value = "Skipping video...";
        self.skipVideo(data);
      });
    };

    EdpuzzleAutoanswer.prototype.skipVideo = function(attempt) {
      var id = attempt._id;
      var teacher_assignment_id = attempt.teacherAssignmentId;
      var referrer = "https://edpuzzle.com/assignments/" + teacher_assignment_id + "/watch";
      var url2 = "https://edpuzzle.com/api/v4/media_attempts/" + id + "/watch";

      var content = {"timeIntervalNumber": 10};
      var headers = [
        ['accept', 'application/json, text/plain, */*'],
        ['accept_language', 'en-US,en;q=0.9'],
        ['content-type', 'application/json'],
        ['x-csrf-token', this.csrf],
        ['x-edpuzzle-referrer', referrer],
        ['x-edpuzzle-web-version', opener.__EDPUZZLE_DATA__.version]
      ];
      
      var self = this;
      this.httpGet(url2, function() {
        var attemptId = attempt._id;
        var filteredQuestions = [];
        
        for (var i = 0; i < document.questions.length; i++) {
          var question = document.questions[i];
          if (question.type != "multiple-choice") { continue; }
          
          if (filteredQuestions.length == 0) {
            filteredQuestions.push([question]);
          }
          else if (filteredQuestions[filteredQuestions.length - 1][0].time == question.time) {
            filteredQuestions[filteredQuestions.length - 1].push(question);
          }
          else {
            filteredQuestions.push([question]);
          }
        }
        
        if (filteredQuestions.length > 0) {
          var total = filteredQuestions.length;
          self.button.value = "Posting answers...";
          self.postAnswers(filteredQuestions, attemptId, total);
        }
      }, headers, "POST", JSON.stringify(content));
    };

    EdpuzzleAutoanswer.prototype.postAnswers = function(remainingQuestions, attemptId, total) {
      var id = this.assignment.teacherAssignments[0]._id;
      var referrer = "https://edpuzzle.com/assignments/" + id + "/watch";
      var answersURL = "https://edpuzzle.com/api/v3/attempts/" + attemptId + "/answers";

      var content = { answers: [] };
      var questionsPart = remainingQuestions.shift();
      for (var i = 0; i < questionsPart.length; i++) {
        var question = questionsPart[i];
        var correctChoices = [];
        for (var j = 0; j < question.choices.length; j++) {
          var choice = question.choices[j];
          if (choice.isCorrect) {
            correctChoices.push(choice._id);
          }
        }
        content.answers.push({
          "questionId": question._id,
          "choices": correctChoices,
          "type": "multiple-choice",
        });
      }
      
      var headers = [
        ['accept', 'application/json, text/plain, */*'],
        ['accept_language', 'en-US,en;q=0.9'],
        ['content-type', 'application/json'],
        ['x-csrf-token', this.csrf],
        ['x-edpuzzle-referrer', referrer],
        ['x-edpuzzle-web-version', opener.__EDPUZZLE_DATA__.version]
      ];
      var self = this;
      this.httpGet(answersURL, function() {
        if (remainingQuestions.length == 0) {
          self.button.value = "Answers submitted successfully.";
          opener.location.reload();
        }
        else {
          var progress = total - remainingQuestions.length;
          self.button.value = "Posting answers... (" + progress + "/" + total + ")";
          self.postAnswers(remainingQuestions, attemptId, total);
        }
      }, headers, "POST", JSON.stringify(content));
    };

    EdpuzzleAutoanswer.prototype.httpGet = function(url, callback, headers, method, content) {
      headers = headers || [];
      method = method || "GET";
      content = content || null;
      
      var request = new XMLHttpRequest();
      request.addEventListener("load", function() { callback(request.responseText); });
      request.open(method, url, true);
      if (document.edpuzzle_data && document.edpuzzle_data.token) {
        headers.push(["authorization", document.edpuzzle_data.token]);
      }
      for (var i = 0; i < headers.length; i++) {
        request.setRequestHeader(headers[i][0], headers[i][1]);
      }
      request.send(content);
    };

    // 答题入口函数
    function answer_questions() {
      var skipper = document.getElementById("skipper");
      var button = document.getElementById("answers_button");
      skipper.disabled = true;
      button.disabled = true; 
      button.value = "Downloading script...";

      var autoanswer = new EdpuzzleAutoanswer();
      autoanswer.init();
    }

    // 在DOM加载完成后初始化
    document.addEventListener('DOMContentLoaded', function() {
      unfocus_checkbox = document.getElementById("pause_on_focus");
      if (unfocus_checkbox && typeof opener.document.visability_change != "undefined") {
        unfocus_checkbox.checked = opener.document.visability_change;
      }
      
      // 初始化视频速度控制元素
      speed_dropdown = document.getElementById("speed_dropdown");
      custom_speed = document.getElementById("custom_speed");
      custom_speed_label = document.getElementById("custom_speed_label");
    });
  </script>
</head>
<body>
  <div class="container">
    <header>
      <div class="header-content">
        <img src="${thumbnail}" alt="Video Thumbnail" class="thumbnail">
        <div class="video-info">
          <h1>${media.title}</h1>
          <p>Uploaded by ${media.user.name} on ${date.toDateString()}</p>
          <p>Assigned on ${assigned_date.toDateString()}, ${deadline_text}</p>
        </div>
      </div>
      <div class="controls">
        <button id="skipper" onclick="skip_video();" disabled>Skip Video</button>
        <button id="answers_button" onclick="answer_questions();" disabled>Answer Questions</button>
        <div class="speed-control">
          <label for="speed_dropdown">Video speed:</label>
          <select name="speed_dropdown" id="speed_dropdown" onchange="video_speed()">
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1" selected>Normal</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="1.75">1.75x</option>
            <option value="2">2x</option>
            <option value="-1">Custom</option>
          </select>
        </div>
        <div class="custom-speed">
          <label id="custom_speed_label" for="custom_speed"></label>
          <input type="range" id="custom_speed" name="custom_speed" value="1" min="0.1" max="16" step="0.1" oninput="video_speed()" hidden>
        </div>
        <div class="pause-control">
          <label for="pause_on_focus">Don't pause on unfocus:</label>
          <input type="checkbox" id="pause_on_focus" name="pause_on_focus" onchange="toggle_unfocus();">
        </div>
      </div>
    </header>
    <main>
      <p class="info">Correct choices are highlighted in green.</p>
      <div id="content" class="questions">
        <p id="loading_text"></p>
      </div>
    </main>
    <footer>
      <!-- if you want to fork this project, please don't remove the credits here. -->
      <!-- not only do you have to keep the credits and copyright notice, you also have to make sure your fork is also open source under the same license -->
      <p>Made by: <a href="https://github.com/ading2210" target="_blank">ading2210</a> on Github | Website: <a href="https://edpuzzle.hs.vc" target="_blank">edpuzzle.hs.vc</a> | Source code: <a href="https://github.com/ading2210/edpuzzle-answers" target="_blank">ading2210/edpuzzle-answers</a></p>
      <p>Licenced under the <a href="https://github.com/ading2210/edpuzzle-answers/blob/main/LICENSE" target="_blank">GNU GPL v3</a>. Do not reupload or redistribute without abiding by those terms.</p>
      <p>Available now from our <a href="https://edpuzzle.hs.vc/discord.html" target="_blank">Discord server</a>: <i>An open beta of a completely overhauled GUI, with proper mobile support, ChatGPT integration for open-ended questions, and more.</i></p>
    </footer>
  </div>
</body>
</html>`;

  popup = window.open("about:blank", "", "width=600, height=400");
  popup.document.write(base_html);
  popup.document.close();

  popup.document.assignment = assignment;
  popup.document.edpuzzle_data = window.__EDPUZZLE_DATA__;
  popup.window.onload = () => {getMedia(assignment)};
}

function getMedia(assignment) {
  const text = popup.document.getElementById("loading_text");
  const content = popup.document.getElementById("content");

  text.innerHTML = `Fetching assignments...`;
  
  const media_id = assignment.teacherAssignments[0].contentId;
  const url2 = `https://edpuzzle.com/api/v3/media/${media_id}`;

  function handle_error(msg) {
    text.remove();
    content.innerHTML += `<p style="font-size: 12px">${msg}</p>`;
    popup.document.getElementById("skipper").disabled = false;
  }

  fetch(url2, {credentials: "omit"})
    .then(response => {
      if (!response.ok) {
        handle_error(`Error: Status code ${response.status} received when attempting to fetch the answers.`);
      }
      else return response.json();
    })
    .then(media => {
      if (!media) return;
      parseQuestions(media.questions, media_id);
    })
    .catch((error) => {
      handle_error(`Error when trying to fetch the answers: ${error}`);
    })
}

function parseQuestions(questions, media_id) {
  const text = popup.document.getElementById("loading_text");
  const content = popup.document.getElementById("content");
  popup.document.questions = questions;
  text.remove();

  if (questions == null) {
    content.innerHTML += `<p style="font-size: 12px">Error: Could not get the media for this assignment. </p>`;
    return;
  }
  
  // 添加调试信息
  console.log("Debug: Total questions found:", questions ? questions.length : 0);
  if (questions && questions.length > 0) {
    console.log("Debug: First question:", questions[0]);
    console.log("Debug: Question types:", questions.map(q => q.type));
  }
  
  let question;
  let counter = 0;
  let counter2 = 0;
  for (let i=0; i<questions.length; i++) {
    for (let j=0; j<questions.length-i-1; j++) {
      if (questions[j].time > questions[j+1].time){
       const question_old = questions[j];
       questions[j] = questions[j + 1];
       questions[j+1] = question_old;
     }
    }
  }
  
  for (let i=0; i<questions.length; i++) {
    question = questions[i];
    const choices_lines = [];
    
    if (typeof question.choices != "undefined") {
      const min = Math.floor(question.time/60).toString();
      let secs = Math.floor(question.time%60).toString();
      if (secs.length == 1) {
        secs = "0"+secs;
      }
      const timestamp = min+":"+secs;
      let question_content;
      if (question.body[0].text != "") {
        question_content = `<p>${question.body[0].text}</p>`;
      }
      else {
        question_content = question.body[0].html;
      }

      let answer_exists = false;
      let correctFlags = []; // 调试：收集所有选择项的正确标记
      for (let j=0; j<question.choices.length; j++) {
        const choice = question.choices[j];
        if (typeof choice.body != "undefined") {
          counter++;
          let item_html;
          if (choice.body[0].text != "") {
            item_html = `<p>${choice.body[0].text}</p>`;
          }
          else {
            item_html = `${choice.body[0].html}`;
          }
          
          // 调试：记录正确答案标记的各种可能字段
          correctFlags.push({
            isCorrect: choice.isCorrect,
            correct: choice.correct,
            is_correct: choice.is_correct,
            choiceCorrect: choice.choiceCorrect
          });
          
          if (choice.isCorrect == true) {
            choices_lines.push(`<li class="choice choice-correct">${item_html}</li>`);
            answer_exists = true;
          }
          else {
            choices_lines.push(`<li class="choice">${item_html}</li>`);
          }
        }
      }
      
      // 调试：如果没有找到正确答案，记录问题
      if (!answer_exists) {
        console.log("Debug: No correct answer found for question", i, "correctFlags:", correctFlags);
        console.log("Debug: Full question object:", question);
        
        // 仅在前3个问题显示调试信息，避免页面过长
        if (counter2 < 3) { 
          content.innerHTML += `
            <div style="background: #1a1a1a; padding: 10px; margin: 10px 0; border: 1px solid #333; border-radius: 5px;">
              <p style="color: #ff6b6b; font-size: 12px; margin-bottom: 5px;"><strong>🔍 Debug Info (Question ${i}):</strong></p>
              <pre style="color: #8be9fd; font-size: 10px; margin: 0; white-space: pre-wrap;">${JSON.stringify({
                questionIndex: i,
                questionType: question.type,
                choicesCount: question.choices?.length || 0,
                correctFlags: correctFlags,
                firstChoice: question.choices?.[0] || null
              }, null, 2)}</pre>
            </div>
          `;
        }
        continue;
      }
      
      const choices_html = choices_lines.join("\n");
      let table = ``
      if (counter2 != 0) {
        table += `<hr>`;
      }
      table += `
      <table>
        <tr class="header no_vertical_margin">
          <td class="timestamp_div no_vertical_margin">
            <p>[${timestamp}]</p>
          </td>
          <td class="question">
            ${question_content}
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <ul style="margin-top: 6px; margin-bottom: 0px; padding-left: 18px;">
              ${choices_html}
            </ul>
          </td>
        </tr>
      </table>
      `;
      
      content.innerHTML += table;
      counter2++;
    }
  }
  popup.document.getElementById("skipper").disabled = false;
  if (counter == 0 || counter2 == 0) {
    const url2 = `https://edpuzzle.com/media/${media_id}`;
    
    // 添加详细的调试信息
    let debugInfo = `
      <p style="font-size: 12px"><strong>Debug Information:</strong></p>
      <ul style="font-size: 11px; margin-left: 15px;">
        <li>Total questions found: ${questions ? questions.length : 0}</li>
        <li>Questions with choices: ${counter}</li>
        <li>Valid questions processed: ${counter2}</li>
    `;
    
    if (questions && questions.length > 0) {
      const questionTypes = questions.map(q => q.type || 'unknown').join(', ');
      debugInfo += `<li>Question types: ${questionTypes}</li>`;
    }
    
    debugInfo += `</ul>`;
    
    content.innerHTML += debugInfo + `
      <div style="background: #2d1b69; padding: 15px; margin: 15px 0; border-left: 4px solid #bd93f9; border-radius: 5px;">
        <p style="color: #bd93f9; font-size: 14px; margin-bottom: 10px;"><strong>🔒 Security Update Detected</strong></p>
        <p style="font-size: 12px; margin-bottom: 8px;">Edpuzzle has secured their API - all choice answers now return <code>isCorrect: false</code> for student accounts.</p>
        <p style="font-size: 12px; margin-bottom: 8px;">This prevents answer-cheating scripts from working with student access.</p>
      </div>
      
      <p style="font-size: 12px"><b>🛠️ Workaround (Requires Teacher Account):</b></p>
      <ol style="font-size: 12px; padding-left: 12px; line-height: 1.4;">
        <li>Open <a href="https://edpuzzle.com" target="_blank">edpuzzle.com</a> in a new incognito window</li>
        <li>Sign up for a <strong>teacher account</strong> (only email required)</li>
        <li>Access this video with teacher permissions: <a href="${url2}" target="_blank">${url2}</a></li>
        <li>Teacher accounts can see correct answers that student accounts cannot</li>
      </ol>
      
      <p style="font-size: 11px; color: #6272a4; margin-top: 15px;">
        <strong>Technical Note:</strong> The script found ${questions ? questions.length : 0} questions with ${counter} total choices, 
        but none had <code>isCorrect: true</code> due to API security restrictions.
      </p>
    `;
  }
  else {
    popup.document.getElementById("answers_button").disabled = false;
  }
  popup.questions = questions;
}

// === 所有功能现在都在弹窗HTML中实现 ===



// === 视频选项功能现在在弹窗HTML中实现 ===

// === 脚本入口点 ===
init(); 