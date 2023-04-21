import mysql from 'mysql2';

const mysqlTest = () => {
  const conexion = mysql.createConnection({
    host: process.env.HOST_MYSQL,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASS,
  });

  conexion.connect(function (err) {
    if (err) {
      console.log('Error de conexion: ' + err);
      return;
    }
    console.log('Conectado con el identificador ' + conexion.threadId);
  });
};

export default mysqlTest;
