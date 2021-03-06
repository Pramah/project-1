$(document).ready(function () {
  const tmdbApi = "0adfd846cf8f1168484b5da4e5339d7c";
  let personSearch = "";

  $(document).on("click", ".search", function () {
    $(".topRated").empty();
    personSearch = $(".input").val();
    retreiveData();
    $(".input").val("");
    storeActor(personSearch);
    getActors();
  });

  function retreiveData() {
    //this retreives the person ID so we can use other API searches to get more movies
    let tmdbPersonID = `https://api.themoviedb.org/3/search/person?api_key=${tmdbApi}&language=en-US&query=${personSearch}`;
    //grabbing the num of movies input to pass into .slice below
    let numOfMovies = $(".numOfMovies option:selected").val();
    $(".numOfMoviesError").empty();
    if (numOfMovies === "0") {
      const numOfMoviesError = $("<h3>")
        .text("Error: Please select # of movies to display.")
        .css({
          color: "red",
          "text-align": "center",
          opacity: "none",
          "font-weight": "bold",
        });
      $(".numOfMoviesError").append(numOfMoviesError);
      return;
    }
    $.get(tmdbPersonID, function (response) {
      if (response.results[0] === undefined) {
        $(".errorMsg").text("");
        const errorMsg = $("<h3>")
          .text(
            "Error: This actor is not in our database, please search for a different actor."
          )
          .css({
            color: "red",
            "text-align": "center",
            opacity: "none",
            "font-weight": "bold",
          });
        $(".errorMsg").append(errorMsg);
        return;
      } else {
        $(".errorMsg").text("");
      }
      const personID = response.results[0].id;
      console.log(personID);
      getMovieData(personID);
      getBioData(personID);
    });

    //uses that person ID to do an in depth search for movies
    function getMovieData(personID) {
      const tmdbMovies = `https://api.themoviedb.org/3/person/${personID}/movie_credits?api_key=${tmdbApi}&language=en-US`;

      $.get(tmdbMovies, function (response) {
        const movieArray = response.cast;
        const sortedMovieArray = [];
        $.each(movieArray, function (index) {
          if (
            !movieArray[index].character.includes("Himself") &&
            !movieArray[index].character.includes("Herself")
          ) {
            sortedMovieArray.push(movieArray[index]);
          }
        });
        const sortRating = sortedMovieArray
          .sort((a, b) => {
            return b.popularity - a.popularity;
          })
          .slice(0, numOfMovies);
        //looping through the sorted movies, creating cards with info
        const movieTitleArr = [];
        $.each(sortRating, function (index) {
          const cardContainer = $("<div>")
            .addClass("col-lg-4 col-md-6 d-flex align-items-stretch")
            .css("margin-bottom", "40px");
          const createCard = $("<div>").addClass("card");
          const cardImgContainer = $("<div>").addClass("view");
          const cardImg = $("<img>")
            .attr(
              "src",
              "https://image.tmdb.org/t/p/w200/" + sortRating[index].poster_path
            )
            .attr("alt", "movie poster")
            .addClass("card-img-top");
          cardImgContainer.append(cardImg);
          const cardBody = $("<div>").addClass(
            "card-body deep-blue-gradient text-dark"
          );
          const cardTitle = $("<h3>")
            .addClass("cardTitle" + [index])
            .text(sortRating[index].title);
          movieTitleArr.push(sortRating[index].title);
          const cardVideo = $("<div>").addClass("cardVideo" + [index]);
          const cardText = $("<p>")
            .addClass("card-text text-dark")
            .text(sortRating[index].overview);
          const cardRating = $("<p>")
            .addClass("card-text text-dark")
            .text("Rating: " + sortRating[index].vote_average + "/10");
          cardBody.append(cardTitle, cardText, cardRating);
          createCard.append(cardImgContainer, cardBody, cardVideo);
          cardContainer.append(createCard);
          $(".topRated").append(cardContainer);
        });
        $(".mostPopular").text("Most Popular Movies");
        $.each(movieTitleArr, youtubeCall);
      });
    }
    function youtubeCall(index) {
      const youtubeKey = "AIzaSyBZbcZuo66jOs1JbS-6rmp35rkFd3IPKTs";
      const searchTerm = $(".cardTitle" + [index]).text();
      $.get(
        `https://www.googleapis.com/youtube/v3/search?q=${searchTerm}+trailer&key=${youtubeKey}`,
        function (response) {
          const id = response.items[0].id.videoId;

          getVideo(id);
        }
      );
      function getVideo(id) {
        $.get(
          `https://www.googleapis.com/youtube/v3/videos?part=player&id=` +
            id +
            `&key=${youtubeKey}`,
          function (response) {
            var word = response.items[0].player.embedHtml.split("");

            word.splice(38, 0, "https:");

            var wordJoin = word.join("");
            const video = $(wordJoin);
            $(`.cardVideo` + [index]).append(video);
          }
        );
      }
    }
    function getBioData(personID) {
      const bioData = `https://api.themoviedb.org/3/person/${personID}?api_key=${tmdbApi}`;
      $.get(bioData, function (response) {
        // clear bio div
        $(".bio").text("");
        $(".bio-container").addClass(
          "container col-xl-4 col-lg-5 col-md-6 col-sm-8 justify-content-center"
        );
        // create HTML framework for bio section
        const $imgDiv = $("<div>").addClass("view card-img");
        const $infoDiv = $("<div>").addClass("card-body card-bio");
        $(".bio").append($imgDiv);
        $(".bio").append($infoDiv);
        // grabbing info for bio section
        const actorName = $("<h4>").text(response.name).addClass("card-title");
        const actorBirthday = $("<p>")
          .text("Birthday: " + response.birthday)
          .addClass("card-text text-dark");
        const actorBirthplace = $("<p>")
          .text("Birthplace: " + response.place_of_birth)
          .addClass("card-text text-dark");
        const actorKnownFor = $("<p>")
          .text("Known for: " + response.known_for_department)
          .addClass("card-text text-dark");
        // the 'w' in the url below indicates the size of the image
        const actorImage = $("<img>")
          .attr(
            "src",
            "https://image.tmdb.org/t/p/w500/" + response.profile_path
          )
          .attr("alt", "Actor Image")
          .addClass("card-img-top");
        // dynamically append data to page
        $(".card-img").append(actorImage);
        $(".card-bio").append(
          actorName,
          actorBirthday,
          actorBirthplace,
          actorKnownFor
        );
      });
    }
  }
  // setting items to local storage from search input
  function storeActor(name) {
    if (localStorage.getItem("actor")) {
      $(".previousSearches").empty();
      const whatIsLocalStoreg = JSON.parse(localStorage.getItem("actor"));
      const stuff = [name, ...whatIsLocalStoreg];
      localStorage.setItem("actor", JSON.stringify(stuff));
    } else {
      const firstActor = [name];
      localStorage.setItem("actor", JSON.stringify(firstActor));
    }
  }
  // getting items from local storage and displaying them
  function getActors() {
    if (localStorage.getItem("actor")) {
      const searchedActors = JSON.parse(localStorage.getItem("actor")).slice(
        0,
        5
      );
      const previousHeader = $("<h1>")
        .text("Previous Searches")
        .css("font-size", "31px");
      $(".previousSearches").append(previousHeader);
      $.each(searchedActors, function (index) {
        const actorSearch = $("<p>")
          .append(
            $("<a>")
              .text(searchedActors[index])
              .css("text-transform", "capitalize")
          )
          .addClass("previousActor");
        $(".previousSearches").append(actorSearch);
      });
    }
  }
  //calling get actors here so they load when page loads
  getActors();
  // can click on previous actors to search for them again
  $(document).on("click", ".previousActor", function () {
    $(".topRated").empty();
    personSearch = $(this).text();
    console.log(personSearch);
    retreiveData();
  });
});
