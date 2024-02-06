// Load modules
const express = require('express');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const methodOverride = require('method-override');
// Connect to MongoURI exported from an external file
const keys = require('./config/keys');

// Load models
const User = require('./models/user');
const Post = require('./models/post');
// Passport configuration
require('./passport/google-passport');
require('./passport/facebook-passport');

//Link helpers
const {
    ensureAuthentication, ensureGuest
} = require('./helpers/auth');

// Initialize application
const app = express();

// Configure Handlebars with runtime options
const hbs = exphbs.create({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    handlebars: allowInsecurePrototypeAccess(Handlebars),
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Express config
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    session({
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: true,
    })
);
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());

// Set global vars for user
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Setup static file to serve CSS, JavaScript, and images
app.use(express.static('public'));

// Connect to the remote database
mongoose.Promise = global.Promise;
mongoose
    .connect(keys.MongoURI, {
        //useNewUrlParser: true,
        //useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to Remote Database....');
    })
    .catch((err) => {
        console.error(err);
    });

// Set environment variable for port
const port = process.env.PORT || 3000;

// Handle routes
app.get('/', ensureGuest, (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

// GOOGLE AUTH ROUTE
app.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/',
    }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/profile');
    }
);
//FACEBOOK AUTH ROUTE
app.get(
    '/auth/facebook',
    passport.authenticate('facebook', {
        scope: 'email'
    }));

app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/',
    }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/profile');
    }
);
// //HANDLE PROFILE ROTUE
// app.get('/profile', ensureAuthentication, (req, res) => {
//     // if (req.user) {
//     //     User.findById({ _id: req.user._id })
//     //         .then((user) => {
//     //             res.render('profile', {
//     //                 user: user,
//     //             });
//     //         })
//     //         .catch((err) => {
//     //             console.error(err);
//     //             res.redirect('/');
//     //         });
//     // } else {
//     //     res.redirect('/');
//     // }
//     Post.find({ user: req.user._id })
//         .populate('user')
//         .then((posts) => {
//             res.render('profile', {
//                 post: posts
//             })
//         })
// });
// //HANDLE ROUTE FOR ALL USERS


// // app.get('/users', (req, res) => {
// //     User.find({}).then((users) => {
// //         res.redirect('users', {
// //             users: users
// //         });
// //     });
// // });
// // app.get('/users', (req, res) => {
// //     User.find({}).then((users) => {
// //         // 1. Fix deprecated res.redirect usage
// //         // Instead of:
// //         // res.redirect('users', { users: users });
// //         // Use:
// //         res.status(302).redirect('users');  // Assuming a 302 redirect is intended

// //         // 2. Pass data using a different approach (not through redirect)
// //         // Options:
// //         // - Use res.render() for template rendering
// //         // - Use res.json() for JSON responses
// //         // - Use session data for persistence
// //         // Example using res.json():
// //         // res.json({ users });
// //     });
// // });

// app.get('/users', ensureAuthentication, (req, res) => {
//     User.find({}).then((users) => {
//         res.render('users', {  // Assuming you are using res.render to render a view
//             users: users
//         });
//     });
// });
// // Display one user profile
// app.get('/user/:id', (req, res) => {
//     User.findById({ _id: req.params.id })
//         .then((user) => {
//             res.render('user', {
//                 user: user
//             });
//         });
// });
// // HANDLE EMAIL POST ROUTE
// app.post('/addEmail', (req, res) => {
//     const email = req.body.email;
//     User.findById({ _id: req.user._id })
//         .then((user) => {
//             user.email = email;
//             user.save()
//                 .then(() => {
//                     res.redirect('/profile');
//                 });
//         });
// });
// // HANDLE PHONE POST ROUTE
// app.post('/addPhone', (req, res) => {
//     const phone = req.body.phone;
//     User.findById({ _id: req.user._id })
//         .then((user) => {
//             user.phone = phone;
//             user.save()
//                 .then(() => {
//                     res.redirect('/profile');
//                 });
//         });
// });
// // HANDLE LOCATION POST ROUTE
// app.post('/addLocation', (req, res) => {
//     const location = req.body.location;
//     User.findById({ _id: req.user._id })
//         .then((user) => {
//             user.location = location;
//             user.save()
//                 .then(() => {
//                     res.redirect('/profile');
//                 });
//         });
// });
// // HANDLE get ROUTES FOR POSTS
// app.get('/addPost', (req, res) => {
//     res.render('addPost');
// });
// // handle post route
// app.post('/savePost', (req, res) => {
//     var allowComments;
//     if (req.body.allowComments) {
//         allowComments = true;
//     } else {
//         allowComments = false;
//     }
//     const newPost = {
//         title: req.body.title,
//         body: req.body.body,
//         status: req.body.status,
//         allowComments: allowComments,
//         user: req.user._id
//     }
//     new Post(newPost).save()
//         .then(() => {
//             res.redirect('/posts');
//         });
// });
// // handle posts route
// app.get('/posts', ensureAuthentication, (req, res) => {
//     Post.find({ status: 'public' })
//         .populate('user')
//         .sort({ date: 'desc' })
//         .then((posts) => {
//             res.render('publicPosts', {
//                 posts: posts
//             });
//         });
// });
// // Handle User logout route
// app.get('/logout', (req, res) => {
//     req.logout();
//     res.redirect('/');
// });
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// }); 

// Handle profile route
app.get('/profile', ensureAuthentication, (req, res) => {
    Post.find({ user: req.user._id })
        .populate('user')
        .sort({ date: 'desc' })
        .then((posts) => {
            res.render('profile', {
                posts: posts
            });
        });
});
// HANDLE ROUTE FOR ALL USERS
app.get('/users', ensureAuthentication, (req, res) => {
    User.find({}).then((users) => {
        res.render('users', {
            users: users
        });
    });
});
// Display one user profile
app.get('/user/:id', (req, res) => {
    User.findById({ _id: req.params.id })
        .then((user) => {
            res.render('user', {
                user: user
            });
        });
});
// HANDLE EMAIL POST ROUTE
app.post('/addEmail', (req, res) => {
    const email = req.body.email;
    User.findById({ _id: req.user._id })
        .then((user) => {
            user.email = email;
            user.save()
                .then(() => {
                    res.redirect('/profile');
                });
        });
});
// HANDLE PHONE POST ROUTE
app.post('/addPhone', (req, res) => {
    const phone = req.body.phone;
    User.findById({ _id: req.user._id })
        .then((user) => {
            user.phone = phone;
            user.save()
                .then(() => {
                    res.redirect('/profile');
                });
        });
});
// HANDLE LOCATION POST ROUTE
app.post('/addLocation', (req, res) => {
    const location = req.body.location;
    User.findById({ _id: req.user._id })
        .then((user) => {
            user.location = location;
            user.save()
                .then(() => {
                    res.redirect('/profile');
                });
        });
});
// HANDLE get ROUTES FOR POSTS
app.get('/addPost', (req, res) => {
    res.render('addPost');
});
// handle edit post route
app.get('/editPost/:id', (req, res) => {
    Post.findOne({ _id: req.params.id })
        .then((post) => {
            res.render('editingPost', {
                post: post
            });
        });
});
//handle put route to save edited post
app.put('/editingPost/:id', (req, res) => {
    Post.findOne({ _id: req.params.id })
        .then((post) => {
            var allowComments;
            if (req.body.allowComments) {
                allowComments = true;
            }
            else {
                allowComments = false;
            }
            post.title = req.body.title;
            post.body = req.body.body;
            post.status = req.body.status;
            post.allowComments = allowComments;
            post.save()
                .then(() => {
                    res.redirect('/profile');
                });
        });
});
// handle delete route
// app.delete('/:id', (req, res) => {
//     Post.remove({ _id: req.params.id })
//         .then(() => {
//             res.redirect('profile');
//         })
// })
app.delete('/:id', (req, res) => {
    Post.deleteOne({ _id: req.params.id })
        .then(() => {
            res.redirect('profile');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// handle post route
app.post('/savePost', (req, res) => {
    var allowComments;
    if (req.body.allowComments) {
        allowComments = true;
    } else {
        allowComments = false;
    }
    const newPost = {
        title: req.body.title,
        body: req.body.body,
        status: req.body.status,
        allowComments: allowComments,
        user: req.user._id
    }
    new Post(newPost).save()
        .then(() => {
            res.redirect('/posts');
        });
});
// // handle posts route
// app.get('/posts', ensureAuthentication, (req, res) => {
//     Post.find({ status: 'public' })
//         .populate('user')
//         .populate('comments.commentUser')
//         .sort({ date: 'desc' })
//         .then((posts) => {
//             res.render('publicPosts', {
//                 posts: posts
//             });
//         });
// });
// //save comments into database
// app.post('/addComment/:id', (req, res) => {
//     Post.findOne({ _id: req.params.id })
//         .then((post) => {
//             const newComment = {
//                 commentBody: req.body.commentBody,
//                 commentUser: req.user._id

//             }
//             post.comments.push(newComment)
//             post.save()
//                 .then(() => {
//                     res.redirect('/posts');
//                 });
//         });
// });
// // Handle User logout route
// app.get('/logout', (req, res) => {
//     req.logout();
//     res.redirect('/');
// });
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// }); 
// handle posts route
app.get('/posts', ensureAuthentication, (req, res) => {
    Post.find({ status: 'public' })
        .populate('user')
        .populate('comments.commentUser')
        .sort({ date: 'desc' })
        .then((posts) => {
            res.render('publicPosts', {
                posts: posts
            });
        });
});
// / handle posts route
// app.get('/posts', ensureAuthentication, (req, res) => {
//     Post.find({status:'public'})
//     .populate('user')
//     .populate('comments.commentUser')
//     .sort({date:'desc'})
//     .then((posts) => {
//         res.render('publicPosts', {
//             posts:posts
//         });
//     });
// });
// display single users all public posts
app.get('/showposts/:id', (req, res) => {
    Post.find({ user: req.params.id, status: 'public' })
        .populate('user')
        .sort({ date: 'desc' })
        .then((posts) => {
            res.render('showUserPosts', {
                posts: posts
            });
        });
});
// save comments into database
app.post('/addComment/:id', (req, res) => {
    Post.findOne({ _id: req.params.id })
        .then((post) => {
            const newComment = {
                commentBody: req.body.commentBody,
                commentUser: req.user._id
            }
            post.comments.push(newComment)
            post.save()
                .then(() => {
                    res.redirect('/posts');
                });
        });
});
// // Handle User logout route
// app.get('/logout', (req, res) => {
//     req.logout();
//     res.redirect('/');
// });
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
// Handle User logout route
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.redirect('/');
        }
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
// const { OAuth2Client } = require('google-auth-library');

// // Assuming you have your Google client ID and client secret
// const googleClientId = keys.GoogleClientID;
// const googleClientSecret = keys.GoogleClientSecret;

// const googleOAuth2Client = new OAuth2Client(googleClientId, googleClientSecret);

// // Handle User logout route
// app.get('/logout', async (req, res) => {
//     // Revoke Google access token
//     if (req.user && req.user.googleAccessToken) {
//         try {
//             await googleOAuth2Client.revokeToken({
//                 token: req.user.googleAccessToken,
//             });
//         } catch (error) {
//             console.error('Error revoking Google token:', error.message);
//         }
//     }

//     // Logout from your application
//     req.logout(function (err) {
//         if (err) {
//             console.error(err);
//             return res.redirect('/');
//         }
//         res.redirect('/');
//     });
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
// app.get('/logout', function (req, res, next) {
//     if (req.session) {
//         // delete session object
//         req.session.destroy(function (err) {
//             if (err) {
//                 return next(err);
//             } else {
//                 return res.redirect('/');
//             }
//         });
//     }
// });