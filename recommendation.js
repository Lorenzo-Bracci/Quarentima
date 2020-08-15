"use strict";
const fetch = require("node-fetch");
exports.__esModule = true;
exports.Recommendation = void 0;
var Recommendation = /** @class */ (function () {
    function Recommendation() {
    }
    Recommendation.initLengths = function () {
        return fetch('http://localhost:3000/get-length').then(function (response) {
            return response.json();
        });
    };
    Recommendation.initUser = function (email) {
        var _this = this;
        var result = new Array(this.movieLength);
        return fetch('http://localhost:3000/user/?email=' + email).then(function (res) {
            return res.json();
        }).then(function (user) {
            result[0] = user.email;
            result[1] = user.average;
            var ratings = _this.adjustMovieArray(user.ratings); //read all ratings in the correct form
            for (var j = 2; j < ratings.length + 2; j++) //fill in the return matrix with rating vectors one at a time
                result[j] = ratings[j - 2]; //the ratings array is shifted by two because it does not have email and average
            return result;
        });
    };
    Recommendation.adjustMovieArray = function (arr) {
        var result = new Array(this.movieLength - 2); //initialize an array for storing only movie ratings
        for (var i = 0; i < result.length; i++) //fill the array with zeros
            result[i] = 0;
        for (var i = 0; i < arr.length; i++) { //update with the values of all rated movies at the correct position
            result[arr[i].movieId] = arr[i].rate;
        }
        return result;
    };
    Recommendation.createMatrix = function (email) {
        var _this = this;
        var position = 0;
        var ratingMatrix = [];
        for (var i = 0; i < this.userLength; i++) {
            ratingMatrix[i] = new Array(this.movieLength); // we added one number to 9742 because we added the average;
        }
        return fetch('http://localhost:3000/get-users')
            .then(function (response) {
            return response.json();
        }).then(function (emails) {
            emails.forEach(function (element) {
                if (element != email) {
                    fetch('http://localhost:3000/user/?email=' + element).then(function (res) {
                        return res.json();
                    }).then(function (user) {
                        ratingMatrix[position][0] = user.email;
                        ratingMatrix[position][1] = user.average;
                        //   console.log(ratingMatrix[position][0]);
                        //  console.log(ratingMatrix[position][1]);
                        var ratings = _this.adjustMovieArray(user.ratings); //read all ratings in the correct form
                        for (var j = 2; j < ratings.length + 2; j++) //fill in the return matrix with rating vectors one at a time
                            ratingMatrix[position][j] = ratings[j - 2]; //the ratings array is shifted by two because it does not have email and average
                        position++;
                    });
                }
            });
            return ratingMatrix;
        });
        
    };
    
    Recommendation.simple_avg = function (vector) {
        var acc = 0;
        var notzero = 0;
        for (var _i = 0, vector_1 = vector; _i < vector_1.length; _i++) {
            var vec = vector_1[_i];
            if (vec !== 0) {
                notzero++;
            }
            acc += vec;
        }
        return (acc / notzero);
    };

    Recommendation.weighted_Avg = function (vector, weights) {
        if (vector.length !== weights.length) {
            console.log('error in weighted average');
            return 0;
        }
        var num = 0;
        var deno = 0;
        for (var i = 0; i < vector.length; i++) {
            if (vector[i] !== 0) { // this to deal with the missing rates. and not add the weights.
                num += vector[i] * weights[i];
                deno += weights[i];
            }
        }
        return (num / deno);
    };
    Recommendation.dot = function (val1, val2) {
        if (val1.length !== val2.length) {
            alert('error in dot');
            return 0;
        }
        var result = 0;
        for (var i = 0; i < val1.length; i++) {
            result += (val1[i] * val2[i]);
        }
        return result;
    };
    Recommendation.vector_length = function (vector1) {
        var res = 0;
        for (var _i = 0, vector1_1 = vector1; _i < vector1_1.length; _i++) {
            var vec = vector1_1[_i];
            res += (vec * vec);
        }
        return Math.sqrt(res);
    };
    Recommendation.pearson_similarity = function (vector1, vector2) {
        if (vector1.length !== vector2.length) {
            console.log('error in pearson');
            return 0;
        }
        var commonMovies = 0;
        var vector1_Avg = vector1[1];
        // we get the avgs from the arrays, we already stored the avgs in the arrays.
        var vector2_Avg = vector2[1];
        var pearson_vector1 = new Array(this.movieLength - 2);
        var pearson_vector2 = new Array(this.movieLength - 2);
        for (var i = 2; i < this.movieLength; i++) {
            if (vector1[i] !== 0) {
                pearson_vector1[i - 2] = vector1[i] - vector1_Avg;
                // Changing the vectors to vector-average
            }
            else {
                pearson_vector1[i - 2] = 0;
            }
            if (vector2[i] !== 0) {
                pearson_vector2[i - 2] = vector2[i] - vector2_Avg;
            }
            else {
                pearson_vector2[i - 2] = 0;
            }
            if (vector1[i] !== 0 && vector2[i] !== 0) { // if they both rated a movie than we increment the counter
                commonMovies++;
            }
        }

        var dot = this.dot(pearson_vector1, pearson_vector2);
        var num = this.vector_length(pearson_vector1) * this.vector_length(pearson_vector2);
        if (commonMovies < 6) {
            return 0;
        }
        return (dot / num);
    };
    Recommendation.scorePrediction = function (vector, weights, usersAvg, currentUserAvg) {
        // another weighted average method (better?)
        var num = 0;
        var deno = 0;
        for (var i = 0; i < vector.length; i++) {
            if (vector[i] !== 0) { // this to deal with the missing rates. and not add the weights.
                num += (vector[i] - usersAvg[i]) * weights[i];
            }
            else {
                num += 0; // its only to consider a unrated as an average rated movie.
            }
            deno += weights[i];
        }
        if (deno === 0) {
            return currentUserAvg;
        }
        return ((num / deno) + currentUserAvg);
    };
    Recommendation.sort = function (weights, userID) {
        var arr = new Array(weights.length);
        for (var i = 0; i < weights.length; i++) {
            arr[i] = weights[i];
        }
        for (var i = 0; i < arr.length; i++) {
            var j = i - 1;
            var key = arr[i];
            var keyID = userID[i];
            while (j > -1 && arr[j] < key) {
                arr[j + 1] = arr[j];
                userID[j + 1] = userID[j];
                j--;
            }
            arr[j + 1] = key;
            userID[j + 1] = keyID;
        }
    };
    Recommendation.nearestKNeighbors = function (array, k) {
        var neighborsID = new Array(k);
        var index = new Array(array.length);
        for (var i = 0; i < k; i++) {
            "";
            neighborsID[i] = index[i];
        }
        for (var i = 0; i < array.length; i++) {
            index[i] = i;
        }
        this.sort(array, index);
        for (var i = 0; i < k; i++) {
            neighborsID[i] = index[i];
        }
        return neighborsID;
    };
    Recommendation.recommend = function (email) {
        var _this = this;
        var bestMovies = [];
        this.initLengths().then(function (res) {
            _this.userLength = Number(res[1]);
            _this.movieLength = Number(res[0]) + 2;
            //this.currentUserRatings = ratingsArray;
            _this.createMatrix(email).then(function (res) {
                var ourMatrix = res;
                _this.initUser(email).then(function (res) {
                    _this.currentUserRatings = res;
                    var weights = new Array(_this.userLength);
                    var predictedUserScores = new Array(_this.movieLength - 2); 
                    for (var i = 0; i < _this.userLength; i++) {       
   weights[i] = _this.pearson_similarity(ourMatrix[i], _this.currentUserRatings);                   
}
                    var neighbors = _this.nearestKNeighbors(weights, 20);
                    var neighborWeights = new Array(20);
                    for (var i = 0; i < neighborWeights.length; i++) {
                        neighborWeights[i] = weights[neighbors[i]];
                    }
                    var neighboursRating = new Array(20);
                    for (var i = 0; i < neighborWeights.length; i++) {
                        neighboursRating[i] = ourMatrix[neighbors[i]];
                    }
                    var tneighbor = _this.transpose(neighboursRating);
                   
 for (var i = 2; i < _this.movieLength; i++) {
                        if (_this.currentUserRatings[i] == 0) {
                            predictedUserScores[i - 2] = _this.scorePrediction(tneighbor[i], neighborWeights, tneighbor[1], _this.currentUserRatings[1]);                        
}
                        else {
                            predictedUserScores[i - 2] = 0;
                        }
                    }
                    bestMovies = _this.nearestKNeighbors(predictedUserScores, 100); // this is the number of recommended movies we want to display in watch me.                    
_this.initTranslationArray().then(function (res) {
                        var translation = res;
                        var recommendedmovies = bestMovies
                            .map(function (x) { return translation[x]; });
                        //console.log(recommendedmovies);
                        _this.storeRecommendation(email, recommendedmovies);
                    });
                });
            });
        });
    };
    Recommendation.initTranslationArray = function () {
        return fetch('http://localhost:3000/translation').then(function (response) {
            return response.json();
        });
    };
    Recommendation.storeRecommendation = function (email, recommendations) {
        fetch('http://localhost:3000/store-recommendation', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, ratings: recommendations })
        }).then(function (e) {
            console.log(e);
        });
    };
    Recommendation.transpose = function (array) {
        var transArray = new Array(this.movieLength);
        for (var i = 0; i < this.movieLength; i++) {
            transArray[i] = new Array(array.length); // 20 is just a size k we cna change later
        }
        for (var i = 0; i < this.movieLength; i++) {
            for (var j = 0; j < array.length; j++) {
                transArray[i][j] = array[j][i];
            }
        }
        return transArray;
    };
    /*static async initMatrix() {
      console.log("wat");
      await this.createMatrix().then((matrii) => {
        this.Matrix = matrii;
      });
      console.log(this.Matrix);
    }*/
    Recommendation.getUsers = function () {
        var array = [];
        fetch('http://localhost:3000/get-users')
            .then(function (response) {
            return response.json();
        }).then(function (emails) {
            array = emails;
            console.log(array.length);
            for (var i = 0; i < emails.length; i++) {
                fetch('http://localhost:3000/user/?email=' + emails[i]).then(function (res) {
                    return res.json();
                }).then(function (user) {
                    console.log(user);
                });
            }
        });
    };
    Recommendation.currentUserRatings = [];
    Recommendation.userLength = 0; //server user length and movie length
    Recommendation.movieLength = 0;
    Recommendation.Matrix = [];
    return Recommendation;
}());
exports.Recommendation = Recommendation;
