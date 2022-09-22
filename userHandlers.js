// const { response } = require("express");
const database = require('./database')

const getUsers = (req, res) => {
  const initialSql =
    'select firstname, lastname, email, city, language from users'

  const where = []

  if (req.query.language != null) {
    where.push({
      column: 'language',
      value: req.query.language,
      operator: '='
    })
  }
  if (req.query.city != null) {
    where.push({
      column: 'city',
      values: req.query.city,
      operator: '='
    })
  }

  const newQuery = where.reduce(
    (sql, { column, operator }, index) =>
      `${sql} ${index === 0 ? 'where' : 'and'} ${column} ${operator} ?`,
    initialSql
  )

  const array = where.map(({ values }) => values) // const array = where.map((obj) => obj .values);

  console.log('QUERY QUERY', newQuery)
  console.log('aray aray', array)

  database
    .query(
      where.reduce(
        (sql, { column, operator }, index) =>
          `${sql} ${index === 0 ? 'where' : 'and'} ${column} ${operator} ?`,
        initialSql
      ),
      where.map(({ values }) => values)
    )
    .then(([users]) => {
      console.log('1234662', users)
      res.status(200).json(users)
    })

    .catch(err => {
      console.error(err)
      res.status(500).send('Error retrieving data from database')
    })
}

const getUsersById = (req, res) => {
  const id = parseInt(req.params.id)

  database
    .query('select * from users where id = ?', [id])
    .then(([users]) => {
      if (users[0] != null) {
        res.status(200).json(users[0])
      } else {
        res.status(404).send('Not Found')
      }
    })

    .catch(err => {
      console.error(err)
      res.status(500).send('Error retrieving data from database')
    })
}

const getUserByEmailWithPasswordAndPassToNext = (req, res, next) => {
  const { email } = req.body;

  database
    .query("select * from users where email = ?", [email])
    .then(([users]) => {
      if (users[0] != null) {
        req.user = users[0];

        next();
        
      } else {
        res.sendStatus(401);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};

const postUser = (req, res) => {
  const { firstname, lastname, email, city, language, Hpassword } = req.body

  database
    .query(
      'INSERT INTO users(firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, lastname, email, city, language, Hpassword]
    )
    .then(([result]) => {
      res.location(`/api/users/${result.insertId}`).sendStatus(201)
    })
    .catch(err => {
      console.error(err)
      res.status(500).send('Error saving the movie')
    })
}

const updateUser = (req, res) => {
  const id = parseInt(req.params.id)
  const { firstname, lastname, email, city, language } = req.body

  database
    .query(
      'update users set title = ?, firstname = ?, lastname = ?, email = ?, city = ? where id = ?',
      [firstname, lastname, email, city, language]
    )
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.status(404).send('Not Found')
      } else {
        res.sendStatus(204)
      }
    })
    .catch(err => {
      console.error(err)
      res.status(500).send('Error editing the movie')
    })
}

const deleteUser = (req, res) => {
  const id = parseInt(req.params.id)

  database
    .query('select * from users where id = ?', [id])
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.status(404).send('Not Found')
      } else {
        res.sendStatus(204)
      }
    })

    .catch(err => {
      console.error(err)
      res.status(500).send('Error editing the movie')
    })
}

module.exports = {
  getUsers,
  getUsersById,
  postUser,
  updateUser,
  deleteUser,
  getUserByEmailWithPasswordAndPassToNext
}
