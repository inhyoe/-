const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const nunjucks = require('nunjucks');
var fs = require('fs')
dotenv.config();
const indexRouter = require('./routes');
const userRouter = require('./routes/user');
const loginRouter = require('./routes/login');
var FileStore = require('session-file-store')(session)

// 시퀄라이즈 부분
const { sequelize } = require('./models')

const app = express();


app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log(__dirname)
app.set('port', process.env.PORT || 3000);
nunjucks.configure('views', {
  express: app,
  watch: true,
});



sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  // store: new FileStore(),
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 3000
  },
  name: 'session-cookie',
}));
app.set('view engine','html')
nunjucks.configure('views', {
  express: app,
  watch: true,
});

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/login', loginRouter);

app.post('/')

app.get('/map',(req,res)=>{
  return res.end(fs.readFileSync('views/MapPage/MapPage.html'))
})/* 건들지 말것 */

app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});




app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});



app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
});

