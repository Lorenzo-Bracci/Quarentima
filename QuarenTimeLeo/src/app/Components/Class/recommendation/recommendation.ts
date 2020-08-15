import DatasetFunction from '../../../../assets/detaset';
import { HttpClient } from '@angular/common/http';
import { ɵINTERNAL_BROWSER_PLATFORM_PROVIDERS } from '@angular/platform-browser';

export abstract class Recommendation {
    static currentUserRatings = [];
    static userLength = 0;                                   //server user length and movie length
    static movieLength = 0;
    static Matrix = [];


    static initLengths() {
        return fetch('http://localhost:3000/get-length').then(response => {
            return response.json();
        })
    }



    static initUser(email: string) {
        var result: number[] = new Array(this.movieLength);

        return fetch('http://localhost:3000/user/?email=' + email).then(res => {
            return res.json();
        }).then(user => {
            result[0] = user.email;
            result[1] = user.average;
            var ratings = this.adjustMovieArray(user.ratings);//read all ratings in the correct form
            for (var j = 2; j < ratings.length; j++)//fill in the return matrix with rating vectors one at a time
                result[j] = ratings[j - 2];//the ratings array is shifted by two because it does not have email and average
            return result;
        })

    }
    static adjustMovieArray(arr): number[] {


        var result: number[] = new Array(this.movieLength - 2);//initialize an array for storing only movie ratings
        for (var i = 0; i < result.length; i++)//fill the array with zeros
            result[i] = 0;
        for (var i = 0; i < arr.length; i++) {//update with the values of all rated movies at the correct position
            result[arr[i].movieId] = arr[i].rate;
        }
        return result;

    }

    static createMatrix(email: string) {

        var position: number = 0;
        const ratingMatrix = [];
        for (let i = 0; i < this.userLength; i++) {
            ratingMatrix[i] = new Array(this.movieLength);                                                                        // we added one number to 9742 because we added the average;
        }


        return fetch('http://localhost:3000/get-users')
            .then(response => {
                return response.json();
            }).then((emails) => {
                emails.forEach(element => {
                    if (element != email) {
                        fetch('http://localhost:3000/user/?email=' + element).then(res => {
                            return res.json();
                        }).then((user) => {
                            ratingMatrix[position][0] = user.email;
                            ratingMatrix[position][1] = user.average;

                            //   console.log(ratingMatrix[position][0]);
                            //  console.log(ratingMatrix[position][1]);

                            var ratings = this.adjustMovieArray(user.ratings);      //read all ratings in the correct form
                            for (var j = 2; j < ratings.length; j++)                 //fill in the return matrix with rating vectors one at a time
                                ratingMatrix[position][j] = ratings[j - 2];           //the ratings array is shifted by two because it does not have email and average

                            position++;
                        })
                    }
                })
                return ratingMatrix;
            })

        /*.then((emails) => {                                 //sending requests to get all emails
             emails.forEach(element => {
             //  console.log(emails.length);
             //console.log(emails.indexOf(element));
             if(emails.indexOf(element) === emails.length - 2){
                 console.log("the character");
                 return  fetch('http://localhost:3000/user/?email=' + element).then(res => { 
                     return res.json();}).then(user =>{
                         
                         if(position < 610 && user) {
     
                             ratingMatrix[position][0] = user.email;
                             ratingMatrix[position][1] = user.average;
                            
                             //console.log(ratingMatrix[position][0]);
                             //console.log(ratingMatrix[position][1]);
                             var ratings = this.adjustMovieArray(user.ratings);      //read all ratings in the correct form
                             for(var j = 2; j < ratings.length; j++)                 //fill in the return matrix with rating vectors one at a time
                                 ratingMatrix[position][j] = ratings[j-2];           //the ratings array is shifted by two because it does not have email and average
                             position++;
                         }
                       //  console.log(ratingMatrix[0][0]);
                       //console.log(ratingMatrix);
                       return ratingMatrix;
     
                         
                     })
             }
             else { 
             fetch('http://localhost:3000/user/?email=' + element).then(res => { 
                 return res.json();}).then(user =>{
                     if(position < 610 && user) {
 
                         ratingMatrix[position][0] = user.email;
                         ratingMatrix[position][1] = user.average;
                        
                         //console.log(ratingMatrix[position][0]);
                         //console.log(ratingMatrix[position][1]);
                         var ratings = this.adjustMovieArray(user.ratings);//read all ratings in the correct form
                         for(var j = 2; j < ratings.length; j++)//fill in the return matrix with rating vectors one at a time
                         ratingMatrix[position][j] = ratings[j-2];//the ratings array is shifted by two because it does not have email and average
                         position++;
                     }
                   //  console.log(ratingMatrix[0][0]);
 
                     
                 })
                 }        }); */



    }






    /*static createMatrix() {

       
        const dataset = DatasetFunction;

        const lines = dataset.split('\n');


        const n = lines.length;

        const ratingMatrix = [];
        for (let i = 0; i < this.userLength; i++) {
            ratingMatrix[i] = new Array(this.movieLength);                        // we added one number to 9742 because we added the average;
        }

        for (let i = 0; i < n - 1; i++) {  // each line
            const tokens = lines[i].split(' ');

            for (let j = 0; j < 9744; j++) {  // each val curr line
                ratingMatrix[i][j] = Number(tokens[j]);
            }
        }
       


        return ratingMatrix;
    }*/

    static simple_avg(vector: number[]): number {
        let acc = 0;
        let notzero = 0;
        for (const vec of vector) {
            if (vec !== 0) {
                notzero++;
            }
            acc += vec;
        }

        return (acc / notzero);
    }



    // static createMatrix(){
    //
    //   var position: number = 0;
    //   const ratingMatrix = [];
    //   for (let i = 0; i < this.userLength; i++) {
    //     ratingMatrix[i] = new Array(this.movieLength);                                                                        // we added one number to 9742 because we added the average;
    //   }
    //
    //
    //   return fetch('http://localhost:3000/get-users')
    //     .then(response => {
    //       return response.json();}).then((emails) => {
    //       emails.forEach(element => {
    //         fetch('http://localhost:3000/user/?email=' + element).then(res => {
    //           return res.json();}).then((user) => {
    //           ratingMatrix[position][0] = user.email;
    //           ratingMatrix[position][1] = user.average;
    //
    //           //   console.log(ratingMatrix[position][0]);
    //           //  console.log(ratingMatrix[position][1]);
    //
    //           var ratings = this.adjustMovieArray(user.ratings);      //read all ratings in the correct form
    //           for(var j = 2; j < ratings.length; j++)                 //fill in the return matrix with rating vectors one at a time
    //             ratingMatrix[position][j] = ratings[j-2];           //the ratings array is shifted by two because it does not have email and average
    //
    //           position++;
    //         })
    //       })
    //       return ratingMatrix;
    //     })
    //
    //   /*.then((emails) => {                                 //sending requests to get all emails
    //        emails.forEach(element => {
    //        //  console.log(emails.length);
    //        //console.log(emails.indexOf(element));
    //        if(emails.indexOf(element) === emails.length - 2){
    //            console.log("the character");
    //            return  fetch('http://localhost:3000/user/?email=' + element).then(res => {
    //                return res.json();}).then(user =>{
    //
    //                    if(position < 610 && user) {
    //
    //                        ratingMatrix[position][0] = user.email;
    //                        ratingMatrix[position][1] = user.average;
    //
    //                        //console.log(ratingMatrix[position][0]);
    //                        //console.log(ratingMatrix[position][1]);
    //                        var ratings = this.adjustMovieArray(user.ratings);      //read all ratings in the correct form
    //                        for(var j = 2; j < ratings.length; j++)                 //fill in the return matrix with rating vectors one at a time
    //                            ratingMatrix[position][j] = ratings[j-2];           //the ratings array is shifted by two because it does not have email and average
    //                        position++;
    //                    }
    //                  //  console.log(ratingMatrix[0][0]);
    //                  //console.log(ratingMatrix);
    //                  return ratingMatrix;
    //
    //
    //                })
    //        }
    //        else {
    //        fetch('http://localhost:3000/user/?email=' + element).then(res => {
    //            return res.json();}).then(user =>{
    //                if(position < 610 && user) {
    //
    //                    ratingMatrix[position][0] = user.email;
    //                    ratingMatrix[position][1] = user.average;
    //
    //                    //console.log(ratingMatrix[position][0]);
    //                    //console.log(ratingMatrix[position][1]);
    //                    var ratings = this.adjustMovieArray(user.ratings);//read all ratings in the correct form
    //                    for(var j = 2; j < ratings.length; j++)//fill in the return matrix with rating vectors one at a time
    //                    ratingMatrix[position][j] = ratings[j-2];//the ratings array is shifted by two because it does not have email and average
    //                    position++;
    //                }
    //              //  console.log(ratingMatrix[0][0]);
    //
    //
    //            })
    //            }        }); */
    //
    //
    // }










    static weighted_Avg(vector: number[], weights: number[]): number {

        if (vector.length !== weights.length) {
            alert('error in weighted average');
            return 0;
        }

        let num = 0;
        let deno = 0;

        for (let i = 0; i < vector.length; i++) {
            if (vector[i] !== 0) {                    // this to deal with the missing rates. and not add the weights.
                num += vector[i] * weights[i];
                deno += weights[i];
            }
        }

        return (num / deno);
    }

    static dot(val1: number[], val2: number[]): number {
        if (val1.length !== val2.length) {
            alert('error in dot');
            return 0;
        }

        let result = 0;
        for (let i = 0; i < val1.length; i++) {
            result += (val1[i] * val2[i]);
        }
        return result;
    }

    static vector_length(vector1: number[]): number {

        let res = 0;
        for (const vec of vector1) {
            res += (vec * vec);
        }
        return Math.sqrt(res);

    }

    static pearson_similarity(vector1: number[], vector2: number[]): number {

        if (vector1.length !== vector2.length) {
            alert('error in pearson');
            return 0;
        }
        var commonMovies: number = 0;


        const vector1_Avg = vector1[1];
        // we get the avgs from the arrays, we already stored the avgs in the arrays.
        const vector2_Avg = vector2[1];



        const pearson_vector1: number[] = new Array(this.movieLength - 2);
        const pearson_vector2: number[] = new Array(this.movieLength - 2);

        for (let i = 2; i < this.movieLength; i++) {
            if (vector1[i] !== 0) {
                pearson_vector1[i - 2] = vector1[i] - vector1_Avg;
                // Changing the vectors to vector-average
            } else {
                pearson_vector1[i - 2] = 0;
            }
            if (vector2[i] !== 0) {
                pearson_vector2[i - 2] = vector2[i] - vector2_Avg;
            } else {
                pearson_vector2[i - 2] = 0;
            }
            if (vector1[i] !== 0 && vector2[i] !== 0) { // if they both rated a movie than we increment the counter
                commonMovies++;
            }
        }


        const dot: number = this.dot(pearson_vector1, pearson_vector2);
        const num: number = this.vector_length(pearson_vector1) * this.vector_length(pearson_vector2);


        if (commonMovies < 6) {
            return 0;
        }

        return (dot / num);

    }

    static scorePrediction(vector: number[], weights: number[], usersAvg: number[], currentUserAvg: number): number {
        // another weighted average method (better?)


        let num = 0;
        let deno = 0;

        for (let i = 0; i < vector.length; i++) {
            if (vector[i] !== 0) {                    // this to deal with the missing rates. and not add the weights.
                num += (vector[i] - usersAvg[i]) * weights[i];
            } else {
                num += 0;                        // its only to consider a unrated as an average rated movie.
            }
            deno += weights[i];
        }
        if (deno === 0) {
            return currentUserAvg;
        }


        return ((num / deno) + currentUserAvg);
    }





    static sort(weights: number[], userID: number[]) {
        const arr: number[] = new Array(weights.length);

        for (let i = 0; i < weights.length; i++) {
            arr[i] = weights[i];
        }


        for (let i = 0; i < arr.length; i++) {

            let j = i - 1;
            const key = arr[i];
            const keyID = userID[i];

            while (j > -1 && arr[j] < key) {
                arr[j + 1] = arr[j];
                userID[j + 1] = userID[j];
                j--;
            }

            arr[j + 1] = key;
            userID[j + 1] = keyID;

        }





    }

    static nearestKNeighbors(array: number[], k): number[] {
        const neighborsID: number[] = new Array(k);
        const index: number[] = new Array(array.length);

        for (let i = 0; i < k; i++) {
            ``
            neighborsID[i] = index[i];
        }

        for (let i = 0; i < array.length; i++) {
            index[i] = i;
        }


        this.sort(array, index);

        for (let i = 0; i < k; i++) {
            neighborsID[i] = index[i];
        }

        return neighborsID;
    }
    static recommend(email: string) {
        var bestMovies = [];
        this.initLengths().then((res) => {
            this.userLength = Number(res[1]);
            this.movieLength = Number(res[0]) + 2;

            //this.currentUserRatings = ratingsArray;
            this.createMatrix(email).then(res => {
                let ourMatrix = res;

                this.initUser(email).then((res) => {
                    this.currentUserRatings = res;


                    const weights: number[] = new Array(this.userLength);
                    const predictedUserScores = new Array(this.movieLength - 2);

                    for (let i = 0; i < this.userLength; i++) {
                        weights[i] = this.pearson_similarity(ourMatrix[i], this.currentUserRatings);
                    }

                    const neighbors = this.nearestKNeighbors(weights, 20);


                    const neighborWeights: number[] = new Array(20);
                    for (let i = 0; i < neighborWeights.length; i++) {
                        neighborWeights[i] = weights[neighbors[i]];
                    }

                    const neighboursRating = new Array(20);
                    for (let i = 0; i < neighborWeights.length; i++) {
                        neighboursRating[i] = ourMatrix[neighbors[i]];
                    }

                    const tneighbor = this.transpose(neighboursRating);
                    for (let i = 2; i < this.movieLength; i++) {
                        if (this.currentUserRatings[i] == 0) {
                            predictedUserScores[i - 2] = this.scorePrediction(tneighbor[i], neighborWeights, tneighbor[1], this.currentUserRatings[1]);
                        }
                        else {
                            predictedUserScores[i - 2] = 0;
                        }
                    }

                    bestMovies = this.nearestKNeighbors(predictedUserScores, 100); // this is the number of recommended movies we want to display in watch me. 
                    this.initTranslationArray().then((res) => {
                        const translation = res;
                        var recommendedmovies = bestMovies
                            .map(x => translation[x]);

                        console.log(recommendedmovies);
                        this.storeRecommendation(email, recommendedmovies);
                    })
                });
            });
        })

    }
   

   static initTranslationArray(){

    return fetch('http://localhost:3000/translation').then((response) => {
        return response.json();
    });
    }
    static storeRecommendation(email: string, recommendations: number[]) {
    fetch('http://localhost:3000/store-recommendation', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, ratings: recommendations })
    }).then((e) => {
        console.log(e);
    });
}

   
  static transpose(array) {
    const transArray = new Array(this.movieLength);
    for (let i = 0; i < this.movieLength; i++) {
        transArray[i] = new Array(array.length);                                    // 20 is just a size k we cna change later
    }

    for (let i = 0; i < this.movieLength; i++) {
        for (let j = 0; j < array.length; j++) {
            transArray[i][j] = array[j][i];
        }
    }

    return transArray;
}


  /*static async initMatrix() {

    console.log("wat");
    await this.createMatrix().then((matrii) => {
      this.Matrix = matrii;

    });
    console.log(this.Matrix);

  }*/


  static getUsers() {
    let array = [];
    fetch('http://localhost:3000/get-users')
        .then(response => {
            return response.json();
        }).then((emails) => {
            array = emails;
            console.log(array.length);
            for (var i = 0; i < emails.length; i++) {
                fetch('http://localhost:3000/user/?email=' + emails[i]).then(res => {
                    return res.json();
                }).then(user => {
                    console.log(user);
                })
            }
        });

}




}
