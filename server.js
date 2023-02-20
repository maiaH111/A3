/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Maia Hakimi Student ID: 187568217 Date: Feb 19 2023
*
*  Online (Cyclic) Link: ________________________________________________________
*
********************************************************************************/ 

const blogService = require('./blog-service');
const express = require('express');
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')


const app = express();
const port = process.env.PORT || 8080;
// const router = express.Router(); 

cloudinary.config({
    cloud_name: 'dwt5ihjs8',
    api_key: '622971299817374',
    api_secret: 'MKb2oGPzIvYY3Y3eHdis-8XtkC4',
    secure: true
});
const upload = multer(); //no { storage: storage } 
app.use(express.static('public'));
//step 2 adding the "Post" route.. 
// app.post('/upload', fileUpload.single('image'), function (req, res, next) {
//     let streamUpload = (req) => {
//         return new Promise((resolve, reject) => {
//             let stream = cloudinary.uploader.upload_stream(
//               (error, result) => {
//                 if (result) {
//                   resolve(result);
//                 } else {
//                   reject(error);
//                 }
//               }
//             );

//           streamifier.createReadStream(req.file.buffer).pipe(stream);
//         });
//     };
let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            (error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
}

upload(req).then((uploaded)=>{
    req.body.featureImage = uploaded.url;

    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts

});

  

// // define the route for POST /posts/add
// router.post('/posts/add', upload.single('featureImage'), async (req, res) => {
//   try {
//     // use Cloudinary to upload the file to the cloud
//     const result = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream((error, result) => {
//         if (result) {
//           resolve(result);
//         } else {
//           reject(error);
//         }
//       });
//       streamifier.createReadStream(req.file.buffer).pipe(stream);
//     });
//     console.log(result);

//     // add the featureImage URL to the request body
//     req.body.featureImage = result.url;

//     // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
//     // Your code for processing the request body and adding a new blog post goes here

//     res.redirect('/posts');
//   } catch (error) {
//     console.log(error);
//     res.status(500).send('An error occurred while uploading the file.');
//   }
// });



app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/blog', (req, res) => {
  blogService.getPublishedPosts()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json({message: err});
    });
});

app.get('/posts', (req, res) => {
  if (req.query.category) {
    const category = parseInt(req.query.category);
    blogService.getPostsByCategory(category)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json({message: err});
      });
  } else if (req.query.minDate) {
    const minDateStr = req.query.minDate;
    blogService.getPostsByMinDate(minDateStr)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json({message: err});
      });
  } else {
    blogService.getAllPosts()
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.json({message: err});
      });
  }
});

app.get('/categories', (req, res) => {
  blogService.getCategories()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json({message: err});
    });
});

 
app.get('/addPost', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'addPost.html'));
});

app.post('/posts/add',upload.single("featureImage"),(req, res)=>{
let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            (error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
}

upload(req).then((uploaded)=>{
    req.body.featureImage = uploaded.url;

    // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts

const { title, body } = req.body;
      const newPost = {
        title: title,
        body: body,
        featureImage: uploaded.url,
        createdAt: new Date(),
      };
      
      blogService.addPost(newPost)
        .then((post) => {
          res.redirect('/posts');
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/posts/add');
        });
  }).catch((error) => {
      console.log(error);
      res.redirect('/posts/add');
  });
});
//add the getPostId
app.get('/post/:id', (req, res) => {
  const id = parseInt(req.params.id);
  blogService.getPostById(id)
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.json({message: err});
    });
});


app.use((req, res) => {
  res.status(404).send(__dirname + "Page Not Found");
});

app.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});

blogService.initialize().then(()=>{
  app.listen(HTTP_PORT, () => { 
      console.log('Express http server listening on port: ' + HTTP_PORT); 
  });
}).catch((err)=>{
  console.log('Error: promise can not be fulfilled');
})