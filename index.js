// importing all the required modules 
const { query } = require('express');
const express = require('express');
const sqlite3 = require('sqlite3');
const create = require('./createddb');
const router = express.Router();

// start the app
const app = express();
// data will be sent in the request body
app.use(express.json());

// for serving static files
// app.use(express.static('public'));

// get method for getting the whole data stored in courses or exercise
router.get('/courses',(req,res)=>{
   let db = new sqlite3.Database('saralDB',(err)=>{
       if(!err){
           db.all('select * from courses',(err,data)=>{
               if(err){
                    return res.send('sorry dude something went wrong in your database or data is not matched',err)
               }
               else{
                   return res.send(data);
               }
           })
       }
   })
});

router.get('/courses/:id',(req,res)=>{
    let db = new sqlite3.Database('saralDB',(err)=>{
        if(!err){
            db.all('select * from courses where id = '+req.params.id,(err,data)=>{
                if(err){
                    return res.send('data is not matched')
                }
                else{
                    return res.send(data[0]);
                }
            })
        }
    })
});

router.post('/courses',(req,res)=>{
    let courses = req.body
    let db = new sqlite3.Database('saralDB',(err)=>{
        if (err) {
            console.log('something went wrong ',err)
        }
        else {
            for (let course of courses) {
                db.run('INSERT INTO courses (code, name, logo, description) VALUES (" ' +course.code + ' " , " ' + course.name + ' ", "' + course.logo + '", "'+ course.description +'" )');
            }
            db.close();
            return res.send('Course has been added successfully')
        }
    })
});

router.put('/course/:id',(req,res)=>{
    let name = req.body.name
    let description = req.body.description
    let db = new sqlite3.Database('saralDB',(err)=>{
        if(!err){
            db.run('update courses set name = "'+name+'",description = "'+description+'" where id ="'+req.params.id+'"');
            db.close();
            return res.send('you have updated the data successfully')
        }
    })
});

router.get('/exercises',(req,res)=>{
    let db = new sqlite3.Database('saralDB',(err)=>{
        if(err){
            console.log("you are getting error",err)
        }
        else{
            db.all('select * from exercises',(err,data)=>{
                if(err){
                    console.log("your have error",err)
                }
                else{
                    for (let exercise of data) {
                        if(exercise.childExcercises) {
                            exercise.childExcercises = JSON.parse(exercise.childExcercises)
                        }
                    }
                    return res.send(data);
                }
            })
        }
    })
});

router.get('/courses/:courseid/exercises',(req,res)=>{
    const course_id = req.params.courseid ? parseInt(req.params.courseid) : 1
    let db = new sqlite3.Database('saralDB',(err)=>{
        if(err){
            console.log('you have error in your code ',err)
        }
        else{
            console.log('select * from exercises where course_id = '+course_id)
            db.all('select * from exercises where course_id = '+course_id,(err,data)=>{
                if(err){
                    console.log('You got the error',err)
                }
                else{
                    for (let exercise of data) {
                        if(exercise.childExcercises) {
                            exercise.childExcercises = JSON.parse(exercise.childExcercises)
                        }
                }
                    return res.send(data)
                }
            })
        }
    })
});

router.post('/exercises',(req,res)=>{
    let exercises = req.body.exercises;
    let course_id = req.body.course_id
    let db = new sqlite3.Database('saralDB',(err)=>{
        if(err){
            console.log('something going wrong during posting exercise',err)
        }
        else{
            for (let exercise of exercises) {
                if (exercise.childExercises) {
                    db.run('INSERT INTO exercises (name, logo, description, course_id, childExercises) VALUES(" ' + exercise.name + ' " , " ' + exercise.logo + ' ", "'+ exercise.short_description +'" ,"'+ course_id+' ", "'+ JSON.stringify(exercise.childExercises)+' ")');

                } else  {
                    db.run('INSERT INTO exercises (name, logo, description, course_id) VALUES(" ' + exercise.name + ' " , " ' + exercise.logo + ' ", "'+ exercise.short_description +'" ,"'+ course_id+' ")');
                }
            }
            db.close();   
            return res.send(`Exercise for course id ${course_id} has been added successfully`)
        }
    })
})

router.put('/courses/:courseid/exercises',(req,res)=>{
    let exercises = req.body
    let db = new sqlite3.Database('saralDB',(err)=>{
        if(!err){
            db.all('select * from exercises where course_id = '+req.params.courseid,(err,data)=>{
                if(err){
                        console.log(err)
                }
                else{
                    for (let exercise  of exercises) {
                        const keys = Object.keys(exercise);
                        console.log(keys);
                        let query = "update exercises set";
                        for (let key of keys) {
                            let lastKey = key == keys[keys.length - 1] ? true : false;
                            if(key == 'id') {continue}
                            if (lastKey) {
                                // query = ` ${query} ${key} = ${exercise[key]}`
                                if (key = 'childExcercises') {
                                    query = ` ${query} childExcercises = '${JSON.stringify(exercise[key]).toString()}'`
                                } else  {
                                    query = ` ${query} ${key} = ${exercise[key]}`
                                }
                            } else {
                                if (key = 'childExcercises') {
                                    query = ` ${query} childExcercises = '${JSON.stringify(exercise[key]).toString()}',`
                                } else  {
                                    query = ` ${query} ${key} = ${exercise[key]},`
                                }
                            }
                        }
                        if (keys.length) {
                            query = `${query} where id = ${exercise.id}`;
                            console.log(query);
                            db.run(query)
                        }
                    }
                    db.close();
                    return res.send('You have updated the exercise successfully');
                }
            });
        }
    })
})

router.get('/submissions',(req,res)=>{
    let db = new sqlite3.Database('saralDB',(err)=>{
        if(!err){
            db.all('select * from submissions',(err,data)=>{
                if(err){
                    console.log('error ')
                }
                else{
                    console.log(data)
                    return res.send(data)
                }
            })
        }
    })
})

router.post('/courses/:courseid/exercises/:exerciseid/submission',(req,res)=>{
    let name = req.body.name
    let exercise = req.body.description
    let db = new sqlite3.Database('saralDB',(err)=>{
        if(!err){
            db.run('insert into submissions (name,exercise,exercise_id,course_id) values("'+name+'","'+exercise+'","'+req.params.exerciseid+'","'+req.params.courseid+'")');
            console.log('you have inserted the submission')
            return res.send('you have inserted the data successfully')
        }
        else{
            console.log('cool! you got the error',err)
        }
    })
})

router.delete('/courses/:courid/exercises/:exer_id/submission/:submid',(req,res)=>{
    let db = new sqlite3.Database('saralDB',(err)=>{
        if(!err){
            console.log('select * from submissions where course_id="'+req.params.courid+'" and exercise_id="'+req.params.exer_id+'"')
            db.all('select * from submissions where course_id="'+req.params.courid+'" and exercise_id="'+req.params.exer_id+'"',(err,data)=>{
                if(!err){
                    console
                    let a = data[req.params.submid-1]["id"]
                    console.log(data)
                    db.run('delete from submissions where id='+a)
                    return res.send('hey you have deleted the data')
                }
                else{
                    return res.send('you are doing something wrong brother')
                }
            })
        }
    })
})

app.use('/api', router);

app.listen(2050,()=>{
    console.log('your app is listening: http://localhost:2050')
})
