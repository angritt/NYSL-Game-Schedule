$(document).ready(function(){
  $("#closeChat").hide();
  $("#chatBox").hide();
  // $("#inputs").hide();
  $("#openChat").show();
  var games = [];
  var game;
  var date;
  var location;
  var playingField;
  var map;
  var time;
  var template = "";
  var button;

  $.getJSON('https://api.myjson.com/bins/6yxsf', function(responseJSON){
    games = responseJSON.games;

      //Setup variables and template to fill in gamesSchedule
      $.each(games, function(index,games){
        game = games.game;
        date = games.date;
        location = games.location;
        map = games.map;
        time = games.time;
        playingField = (index+games.location);
        playingField = playingField.replace(/\s/g, '_');
        games["playingField"] = playingField;

        template += `
          <div class="card rounded-0">
            <h3 class="card-header">${date}</h3>
            <div class="card-body">
              <h4 class="card-title">${game}</h4>
              <p class="card-text">${location} at ${time}</p>
              <a id="${game}" href="#${location}" class="btn btn-secondary border-dark mb-3 btn-block">Map</a>
              <div id="${playingField}" class='embed-responsive embed-responsive-4by3 map'></div>
            </div>
          </div>
        `;

      });

      document.getElementById('gamesSchedule').innerHTML = template;

      //Identify Clicked Button and Open Corresponding Map
      $(document.links).click(function(event) {
        if (button == this.id){
          document.getElementById(playingField).outerHTML = "<div id="+playingField +"></div>";
          button = undefined;
        } else {
          document.getElementById(playingField).outerHTML = "<div id="+playingField +"></div>";
          button = this.id;
          for(i in games){
            game = games[i].game;
            if(button == game){
              location = games[i].location;
              playingField = games[i].playingField;
              map = games[i].map;
            }
          }
          document.getElementById(playingField).outerHTML = "<div id="+playingField +" class='embed-responsive embed-responsive-4by3'>"+map+"</div>";
        }
      });

  });

  //Chat Script
    document.getElementById("login").addEventListener("click", login);
    document.getElementById("create-post").addEventListener("click", writeNewPost);
    var audio = new Audio('stop1.mp3');

    //Chat Links and Window
    $(chatLink).click(function(event){
      $("#gamesSchedule").toggle();
      $(".card-header").toggle();
      $(".card-title").toggle();
      $(".card-text").toggle();
      $("#openChat").toggle();

      $("#closeChat").toggle();
      $("#chatBox").toggle();
      getPosts();
    });

    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        $(".advice").hide();
        $("#posts").show();
        $(".inputs").show();
      } else {
        $(".advice").show();
        $("#posts").hide();
        $(".inputs").hide();
        // No user is signed in.
      }
    });

    function login() {
      var provider = new firebase.auth.GoogleAuthProvider();

      firebase.auth().signInWithPopup(provider)
        .then(function () {
          getPosts();
        })
        .catch(function () {
          alert("Something went wrong");
        });
    }

    function writeNewPost() {
      if (!$("#textInput").val()) {
        return
      }

      var text = document.getElementById("textInput").value;
      var userName = firebase.auth().currentUser.displayName;

      // A post entry.
      var postData = {
        name: userName,
        body: text
      };

      // Get a key for a new Post.
      var newPostKey = firebase.database().ref().child('myMatch').push().key;

      var updates = {};
      updates[newPostKey] = postData;

      $("#textInput").val("");

      audio.play();

      return firebase.database().ref().child('myMatch').update(updates);
    }

    function getPosts() {
      firebase.database().ref('myMatch').on('value', function (data) {
        var logs = document.getElementById("posts");
        logs.innerHTML = "";

        var posts = data.val();
        var template = "";

        for (var key in posts) {
          if (posts[key].name == firebase.auth().currentUser.displayName) {
            template += `
              <div class="notification is-info card-text">
                <p class="name">${posts[key].name}:</p>
                <p style="margin-bottom:0.1rem;">${posts[key].body}</p>
              </div>
            `;
          } else {
            template += `
              <div class="notification is-primary card-text">
                <p class="name">${posts[key].name}:</p>
                <p style="margin-bottom:0.1rem;">${posts[key].body}</p>
              </div>
            `;
          }

        }

        logs.innerHTML = template;
        $("html,body,container").animate({ scrollTop: $("#posts").height() }, 300);
      });
    };
});
