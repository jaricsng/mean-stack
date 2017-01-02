var app = angular.module('flapperNews',
  ['ngMaterial',
  'ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '../views/home.html',
                controller: 'MainCtrl',
                resolve: {
                    postPromise: ['posts', function(posts) {
                        return posts.getAll();
                    }]
                }
            })
            .state('posts', {
                url: '/posts/:id',
                templateUrl: '../views/posts.html',
                controller: 'PostsCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: '../views/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            })
            .state('register', {
                url: '/register',
                templateUrl: '../views/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth', function($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }
                }]
            })
            .state('profile', {
                url: '/profile',
                templateUrl: '../views/profile.html',
                controller: 'ProfileCtrl'
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: '../views/dashboard.html',
                controller: 'DashboardCtrl'
            })
            .state('reports', {
                url: '/reports',
                templateUrl: '../views/reports.html',
                controller: 'ReportsCtrl'
            })
            .state('about', {
                url: '/about',
                templateUrl: '../views/about.html'
            });
        $urlRouterProvider.otherwise('home');
    }
]);

app.factory('posts', ['$http', 'auth', function($http, auth) {
    // service body
    var o = {
        posts: []
    };
    // query the '/posts' route and bind a function when request returns
    // get back a list and copy to posts object using angular.copy() - see index.ejs
    o.getAll = function() {
        return $http.get('/posts')
            .success(function(data) {
                angular.copy(data, o.posts);
            });
    };
    // uses router.post in index.js to post a new Post model to mongoDB
    // when $http gets success, it adds this post to the posts object in local factory
    o.create = function(post) {
        return $http.post('/posts', post, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function(data) {
            o.posts.push(data);
        });
    };

    o.upvote = function(post) {
        //use express route for this post's id to add upvote to mongo model
        return $http.put('/posts/' + post._id + '/upvote', null, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function(data) {
            post.votes += 1;
        });
    };

    o.downvote = function(post) {
        //use express route for this post's id to add upvote to mongo model
        return $http.put('/posts/' + post._id + '/downvote', null, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function(data) {
            post.votes -= 1;
        });
    };

    // grab a single post from server
    o.get = function(id) {
        return $http.get('/posts/' + id)
            .then(function(res) {
                return res.data;
            });
    };

    o.addComment = function(id, comment) {
        return $http.post('/posts/' + id + '/comments', comment, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        });
    };

    o.upvoteComment = function(post, comment) {
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function(data) {
            comment.votes += 1;
        });
    };

    o.downvoteComment = function(post, comment) {
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote', null, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function(data) {
            comment.votes -= 1;
        });
    };

    return o;
}]);

app.factory('auth', ['$http', '$window','$state', function($http, $window,$state) {
    var auth = {};
    auth.saveToken = function(token) {
        $window.localStorage['flapper-news-token'] = token;
    };

    auth.getToken = function() {
        return $window.localStorage['flapper-news-token'];
    };

    auth.isLoggedIn = function() {
        var token = auth.getToken();

        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };

    auth.currentUser = function() {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };

    auth.register = function(user) {
        return $http.post('/register', user).success(function(data) {
            auth.saveToken(data.token);
        });
    };

    auth.logIn = function(user) {
        return $http.post('/login', user).success(function(data) {
            auth.saveToken(data.token);
        });
    };

    auth.logOut = function() {
        $window.localStorage.removeItem('flapper-news-token');
        $state.go('home');
    };

    return auth;
}]);

app.controller('MainCtrl', [
    '$scope',
    'posts',
    'auth',
    function($scope, posts, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.posts = posts.posts;

        //set title to blank to prevent empty posts
        $scope.title = '';
        $scope.addPost = function() {
            if ($scope.title.length === 0) {
                alert('Title is required');
                return;
            }
            //check for valid URL
            //var isValidUrl = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.‌​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[‌​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1‌​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00‌​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u‌​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;

            /*
            var url = $scope.link;

            if ($scope.link && !isValidUrl.test(url)) {
                alert('You must include a valid url (ex: http://www.example.com');
                return;
            }
            */
            posts.create({ //mongoose create?
                title: $scope.title,
                link: $scope.link
            });
            //clear the values
            $scope.title = '';
            $scope.link = '';
        };

        $scope.upvote = function(post) {
            //we're calling the upvote() function and passing in our post
            posts.upvote(post);
        };
        $scope.downvote = function(post) {
            posts.downvote(post);
        };
    }
]);

app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.user = {};

        $scope.register = function() {
            auth.register($scope.user).error(function(error) {
                $scope.error = error;
            }).then(function() {
                $state.go('home');
            });
        };

        $scope.logIn = function() {
            auth.logIn($scope.user).error(function(error) {
                $scope.error = error;
            }).then(function() {
                $state.go('home');
            });
        };
    }
]);

app.controller('PostsCtrl', [
    '$scope',
    '$stateParams',
    'posts',
    'post',
    'auth',
    function($scope, $stateParams, posts, post, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.post = post;
        $scope.addComment = function() {
            if ($scope.body === '') {
                return;
            }
            posts.addComment(post._id, {
                body: $scope.body,
                author: 'user'
            }).success(function(comment) {
                $scope.post.comments.push(comment);
            });
            $scope.body = '';
        };


        $scope.upvote = function(comment) {
            posts.upvoteComment(post, comment);
        };

        $scope.downvote = function(comment) {
            posts.downvoteComment(post, comment);
        };
    }
]);

app.controller('NavCtrl', [
    '$scope',
    'auth',
    function($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }
]);

app.controller('ReportsCtrl', [
    '$scope',
    'auth',
    function($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }
]);

app.controller('DashboardCtrl', [
    '$scope',
    'auth',
    function($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }
]);

app.controller('ProfileCtrl', [
    '$scope',
    'auth',
    function($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }
]);
