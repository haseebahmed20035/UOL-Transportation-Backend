const db = require('./config/db')
const admin = require('./firebase');
const express = require('express')
const cors = require('cors')
const transporter = require('./config/mail')
const app = express()

app.use(cors())
app.use(express.json())

// auth routes
app.use('/api/auth', require('./routes/authRoutes'))

const PORT = 5000

// ================= ROUTES =================

// 🔹 Get routes
app.get('/routes', (req, res) => {
  const sql = `
    SELECT id, route_name, source, destination, estimated_time
    FROM routes
    ORDER BY id DESC
  `

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error' })
    res.json(result)
  })
})

// 🔹 Get buses
app.get('/buses', (req, res) => {
  const sql = `
  SELECT 
    b.id,
    b.bus_number,
    b.capacity,
    b.driver_id,
    d.name AS driver_name,
    r.route_name
  FROM buses b
  LEFT JOIN drivers d ON b.driver_id = d.id
  LEFT JOIN routes r ON b.route_id = r.id
`

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error' })
    res.json(result)
  })
})

// 🔹 Available drivers
app.get('/available-drivers', (req, res) => {
  db.query('SELECT * FROM drivers WHERE is_available = 1', (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error' })
    res.json(result)
  })
})

app.post('/add-route', (req, res) => {
  const { route_name, source, destination, estimated_time, stops } = req.body

  if (!route_name || !source || !destination || !stops || stops.length === 0) {
    return res.status(400).json({ message: 'Invalid route data' })
  }

  db.query(
    'INSERT INTO routes (route_name, source, destination, estimated_time) VALUES (?, ?, ?, ?)',
    [route_name, source, destination, estimated_time],
    (err, result) => {
      if (err) {
        console.log('🔥 ROUTE INSERT ERROR:', err)
        return res.status(500).json({ message: err.message })
      }

      const routeId = result.insertId

      const stopQueries = stops.map((stop, index) => {
        return new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO route_stops (route_id, stop_name, latitude, longitude) VALUES (?, ?, ?, ?)',
            [
              routeId,
              stop.stop_name,
              Number(stop.latitude),
              Number(stop.longitude)
            ],
            err => {
              if (err) {
                console.log('🔥 STOP INSERT ERROR:', err)
                reject(err)
              } else resolve()
            }
          )
        })
      })

      Promise.all(stopQueries)
        .then(() => res.json({ message: 'Route added successfully' }))
        .catch(() => res.status(500).json({ message: 'Stop insert error' }))
    }
  )
})

app.get('/routes-with-stops', (req, res) => {
  const sql = `
    SELECT 
  r.id,
  r.route_name,
  r.source,
  r.destination,
  r.estimated_time,
  s.stop_name,
  s.latitude,
  s.longitude,
  s.stop_order
FROM routes r
LEFT JOIN route_stops s ON r.id = s.route_id
ORDER BY r.id, s.stop_order
  `

  db.query(sql, (err, result) => {
    if (err) {
      console.log('🔥 ROUTE INSERT ERROR:', err)
      return res.status(500).json({ message: err.message })
    }

    const grouped = {}

    result.forEach(row => {
      if (!grouped[row.id]) {
        grouped[row.id] = {
          id: row.id,
          route_name: row.route_name,
          source: row.source,
          destination: row.destination,
          estimated_time: row.estimated_time,
          stops: []
        }
      }

      if (row.stop_name) {
        grouped[row.id].stops.push({
          stop_name: row.stop_name,
          latitude: row.latitude,
          longitude: row.longitude,
          order: row.stop_order
        })
      }
    })

    res.json(Object.values(grouped))
  })
})

// ================= ADD BUS =================

app.post('/add-bus', (req, res) => {
  const {
  driver_id,
  capacity,
  route_id,
  departure_timings,
} = req.body

  if (!driver_id || !route_id) {
    return res.status(400).json({ message: 'Driver and route required' })
  }

  db.query(
    'SELECT name FROM drivers WHERE id = ?',
    [driver_id],
    (err, dRes) => {
      if (err || dRes.length === 0)
        return res.status(400).json({ message: 'Invalid driver' })

      const driver_name = dRes[0].name

      db.query(
        'SELECT route_name FROM routes WHERE id = ?',
        [route_id],
        (err, rRes) => {
          if (err || rRes.length === 0)
            return res.status(400).json({ message: 'Invalid route' })

          const route_name = rRes[0].route_name

          db.query(
            'SELECT bus_number FROM buses ORDER BY id DESC LIMIT 1',
            (err, last) => {
              let next = 1

              if (last.length > 0) {
                const num = parseInt(last[0].bus_number.split('-')[1]) || 0
                next = num + 1
              }

              const busNo = `BUS-${String(next).padStart(3, '0')}`

              db.query(
                `INSERT INTO buses 
              (bus_number, route_id, capacity, driver_id, driver_name, route_name, status)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  busNo,
                  route_id,
                  capacity,
                  driver_id,
                  driver_name,
                  route_name,
                  'active'
                ],
                err => {
                  if (err) {
                    console.log('🔥 ROUTE INSERT ERROR:', err)
                    return res.status(500).json({ message: err.message })
                  }

                 db.query(
  'UPDATE drivers SET is_available = 0 WHERE id = ?',
  [driver_id]
)

// 🔥 SAVE DEPARTURE TIMINGS
if (departure_timings?.length > 0) {
  departure_timings.forEach(time => {
    db.query(
      `INSERT INTO departure_timings
       (route_id, departure_time)
       VALUES (?, ?)`,
      [route_id, time]
    )
  })
}

res.json({ message: 'Bus added successfully' })
                }
              )
            }
          )
        }
      )
    }
  )
})

// ================= DELETE BUS =================

app.delete('/delete-bus/:id', (req, res) => {
  const busId = req.params.id

  db.query(
    'SELECT driver_id FROM buses WHERE id = ?',
    [busId],
    (err, result) => {
      if (err || result.length === 0)
        return res.status(400).json({ message: 'Bus not found' })

      const driver_id = result[0].driver_id

      db.query('DELETE FROM buses WHERE id = ?', [busId], err => {
        if (err) return res.status(500).json({ message: 'Delete failed' })

        if (driver_id) {
          db.query(
            'UPDATE drivers SET is_available = 1, bus_id = NULL WHERE id = ?',
            [driver_id]
          )
        }

        res.json({ message: 'Bus deleted successfully' })
      })
    }
  )
})

// ================= UPDATE BUS =================

app.put('/update-bus/:id', (req, res) => {
  const busId = req.params.id

  db.query(
    'SELECT driver_id FROM buses WHERE id = ?',
    [busId],
    (err, result) => {
      if (err || result.length === 0)
        return res.status(400).json({ message: 'Bus not found' })

      const oldDriver = result[0].driver_id
      const newDriver = req.body.driver_id
      const newRoute = req.body.route_id

      let totalTasks = 0
      let completed = 0
      let errorSent = false

      const done = err => {
        if (errorSent) return

        if (err) {
          errorSent = true
          console.log(err)
          return res.status(500).json({ message: 'DB error' })
        }

        completed++
        if (completed === totalTasks) {
          res.json({ message: 'Bus updated successfully' })
        }
      }

      // DRIVER UPDATE
      if (newDriver && newDriver !== oldDriver && oldDriver) {
        totalTasks += 3

        db.query(
          'UPDATE drivers SET is_available = 1, bus_id = NULL WHERE id = ?',
          [oldDriver],
          done
        )

        db.query(
          'UPDATE drivers SET is_available = 0, bus_id = ? WHERE id = ?',
          [busId, newDriver],
          done
        )

        db.query(
          'UPDATE buses SET driver_id = ?, driver_name = (SELECT name FROM drivers WHERE id = ?) WHERE id = ?',
          [newDriver, newDriver, busId],
          done
        )
      }

      // ROUTE UPDATE
      if (newRoute) {
        totalTasks++

        db.query(
          `UPDATE buses 
           SET route_id = ?, 
               route_name = (SELECT CONCAT(source, ' → ', destination) FROM routes WHERE id = ?) 
           WHERE id = ?`,
          [newRoute, newRoute, busId],
          done
        )
      }

      if (totalTasks === 0) {
        return res.json({ message: 'No changes made' })
      }
    }
  )
})

// ================= VIEW BUS =================
app.get('/bus-details/:id', (req, res) => {
  const busId = req.params.id

  const sql = `
    SELECT 
      b.id AS bus_id,
      b.bus_number,
      b.capacity,
      b.status,
      d.name AS driver_name,
      r.id AS route_id,
      r.route_name,
      r.source,
      r.destination,
      r.estimated_time,
      s.stop_name,
      s.latitude,
      s.longitude,
      s.stop_order
    FROM buses b
    LEFT JOIN drivers d ON b.driver_id = d.id
    LEFT JOIN routes r ON b.route_id = r.id
    LEFT JOIN route_stops s ON r.id = s.route_id
    WHERE b.id = ?
    ORDER BY s.stop_order ASC
  `

  db.query(sql, [busId], (err, result) => {
    if (err) {
      console.log(err)
      return res.status(500).json({ message: err.message })
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Bus not found' })
    }

    const bus = {
      bus_id: result[0].bus_id,
      bus_number: result[0].bus_number,
      capacity: result[0].capacity,
      status: result[0].status,
      driver_name: result[0].driver_name,
      route: {
        id: result[0].route_id,
        route_name: result[0].route_name,
        source: result[0].source,
        destination: result[0].destination,
        estimated_time: result[0].estimated_time,
        stops: []
      }
    }

    result.forEach(row => {
      if (row.stop_name) {
        bus.route.stops.push({
          name: row.stop_name,
          latitude: row.latitude,
          longitude: row.longitude,
          order: row.stop_order
        })
      }
    })

    res.json(bus)
  })
})

// ================= DELETE ROUTE =================
app.delete('/delete-route/:id', (req, res) => {
  const routeId = req.params.id

  // ❗ First delete dependent stops
  db.query('DELETE FROM route_stops WHERE route_id = ?', [routeId], err => {
    if (err) return res.status(500).json({ message: 'Stop delete error' })

    // ❗ Then delete route
    db.query('DELETE FROM routes WHERE id = ?', [routeId], err => {
      if (err) return res.status(500).json({ message: 'Route delete error' })

      res.json({ message: 'Route deleted successfully' })
    })
  })
})

// ================= UPDATE ROUTE =================
app.put('/update-route/:id', (req, res) => {
  const routeId = req.params.id
  const { route_name, source, destination, estimated_time, stops } = req.body

  db.query(
    'UPDATE routes SET route_name=?, source=?, destination=?, estimated_time=? WHERE id=?',
    [route_name, source, destination, estimated_time, routeId],
    err => {
      if (err) return res.status(500).json({ message: 'Update failed' })

      // ❗ delete old stops
      db.query('DELETE FROM route_stops WHERE route_id = ?', [routeId], err => {
        if (err) return res.status(500).json({ message: 'Stop delete error' })

        // ❗ insert updated stops
        const queries = stops.map((s, i) => {
          return new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO route_stops (route_id, stop_name, latitude, longitude, stop_order) VALUES (?, ?, ?, ?, ?)',
              [routeId, s.stop_name, s.latitude, s.longitude, i + 1],
              err => (err ? reject(err) : resolve())
            )
          })
        })

        Promise.all(queries)
          .then(() => res.json({ message: 'Route updated successfully' }))
          .catch(() => res.status(500).json({ message: 'Stop insert error' }))
      })
    }
  )
})

// ================= ADD STUDENT =================

app.post('/add-student', (req, res) => {
  const { name, email, reg_no, department } = req.body

  if (!name || !email || !reg_no) {
    return res.status(400).json({ message: 'Required fields missing' })
  }

  const tempPass = Math.random().toString(36).slice(-8)

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, exist) => {
    if (err) return res.status(500).json({ message: 'DB error' })

    if (exist.length > 0) {
      return res.status(400).json({ message: 'Email already exists' })
    }

    db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, tempPass, 'student'],
      (err, userRes) => {
        if (err) {
          console.log('USER INSERT ERROR:', err)
          return res.status(500).json({ message: err.message })
        }

        const userId = userRes.insertId

        db.query(
          `INSERT INTO students (user_id, reg_no, department) VALUES (?, ?, ?)`,
          [userId, reg_no, department],
          err => {
            if (err) {
              console.log('STUDENT INSERT ERROR:', err)
              return res.status(500).json({ message: err.message })
            }

            res.json({
              message: 'Student added successfully'
            })

            transporter.sendMail(
              {
                from: 'haseeb.ahmed20035@gmail.com',
                to: email,
                subject: 'UOL Transport Account Created 🚍',
                html: `
                  <h2>🚍 UOL Transport System</h2>
                  <p>Hello <b>${name}</b>,</p>
                  <p>Email: ${email}</p>
                  <p>Password: ${tempPass}</p>
                  <p>Registration No: ${reg_no}</p>
                  <p><b>Role:</b> student</p>
                  <p>You can change password from "My Personal Info"</p>
                `
              },
              err => {
                if (err) {
                  console.log('MAIL ERROR:', err)
                } else {
                  console.log('MAIL SENT SUCCESS')
                }
              }
            )
          }
        )
      }
    )
  })
}) 

app.get("/student/:userId", (req, res) => {
  const userId = req.params.userId;

    const sql = `
    SELECT 
      s.id AS student_id,
      u.id AS user_id,
      u.name,
      u.email,
      s.reg_no,
      s.department
    FROM users u
    JOIN students s ON u.id = s.user_id
    WHERE u.id = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(result[0]);
  });
});

// ==============================OTP============================
const otpStore = {}; // temp store

app.post("/send-otp", (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[email] = otp;

  transporter.sendMail({
    from: "haseeb.ahmed20035@gmail.com",
    to: email,
    subject: "OTP Verification",
    html: `<h2>Your OTP for change password is: ${otp}</h2>`
  }, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Email failed" });
    }

    res.json({ message: "OTP sent successfully" });
  });
});


app.post("/change-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (otpStore[email] != otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  db.query(
    "UPDATE users SET password = ? WHERE email = ?",
    [newPassword, email],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });

      delete otpStore[email];

      res.json({ message: "Password updated successfully" });
    }
  );
});

// ====================================View All Students========================
app.get("/all-students", (req, res) => {
  const sql = `
    SELECT 
      u.id,
      u.name,
      u.email,
      s.reg_no,
      s.department
    FROM users u
    JOIN students s ON u.id = s.user_id
    ORDER BY u.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    res.json(result);
  });
});

app.get('/student-requests', (req, res) => {
  const sql = `
    SELECT
      tr.id,
      tr.status,
      tr.request_time,
      tr.route_id,

      s.id AS student_id,
      s.reg_no,
      s.department,

      u.name,
      u.email,

      r.route_name,
      r.source,
      r.destination,
      r.estimated_time

    FROM transport_requests tr

    LEFT JOIN students s
      ON tr.student_id = s.id

    LEFT JOIN users u
      ON s.user_id = u.id

    LEFT JOIN routes r
      ON tr.route_id = r.id

    WHERE tr.status = 'pending'
    ORDER BY tr.id DESC
  `

  db.query(sql, async (err, result) => {
    if (err) {
      console.log(err)
      return res
        .status(500)
        .json({ message: 'DB Error' })
    }

    try {
      const finalData = await Promise.all(
        result.map(student => {
          return new Promise((resolve, reject) => {
            const stopSql = `
              SELECT stop_name, latitude, longitude
              FROM route_stops
              WHERE route_id = ?
              ORDER BY stop_order ASC
            `

            db.query(
              stopSql,
              [student.route_id],
              (err, stops) => {
                if (err) {
                  reject(err)
                } else {
                  resolve({
                    ...student,
                    stops,
                    status: 'pending',
                    request_time:
                      new Date().toLocaleString(),
                  })
                }
              },
            )
          })
        }),
      )

      res.json(finalData)
    } catch (e) {
      console.log(e)

      res
        .status(500)
        .json({ message: 'Server Error' })
    }
  })
})

app.post('/request-transport', (req, res) => {
  const { student_id, route_id } = req.body

  const sql = `
    INSERT INTO transport_requests
    (student_id, route_id)
    VALUES (?, ?)
  `

  db.query(
    sql,
    [student_id, route_id],
    (err, result) => {
      if (err) {
        console.log(err)

        return res
          .status(500)
          .json({ message: 'DB Error' })
      }

      res.json({
        message:
          'Transport request submitted successfully',
      })
    },
  )
})

// ===========================Approve Request===========================
app.put('/approve-request/:id', (req, res) => {
  const requestId = req.params.id
  const { route_id } = req.body

  // FIND BUS FOR ROUTE
  const busSql = `
    SELECT id
    FROM buses
    WHERE route_id = ?
    LIMIT 1
  `

  db.query(busSql, [route_id], (err, busRes) => {
    if (err) {
      return res.status(500).json({
        message: 'Bus fetch error',
      })
    }

    const busId = busRes?.[0]?.id || null

    const updateSql = `
      UPDATE transport_requests
      SET
        status = 'approved',
        approved_at = NOW(),
        assigned_bus_id = ?
      WHERE id = ?
    `

    db.query(
      updateSql,
      [busId, requestId],
      err => {
        if (err) {
          return res.status(500).json({
            message: 'Approval failed',
          })
        }

        res.json({
          message: 'Request approved successfully',
        })
      },
    )
  })
})

// ===========================Approve Request===========================
app.put('/reject-request/:id', (req, res) => {
  const requestId = req.params.id

  db.query(
    `
    UPDATE transport_requests
    SET status = 'rejected'
    WHERE id = ?
  `,
    [requestId],
    err => {
      if (err) {
        return res.status(500).json({
          message: 'Reject failed',
        })
      }

      res.json({
        message: 'Request rejected',
      })
    },
  )
})

// ================= APPROVED ROUTE =================
app.get('/student-approved-route/:studentId', (req, res) => {
  const studentId = req.params.studentId

  const sql = `
    SELECT
      tr.id,
      tr.status,
      tr.approved_at,

      r.id AS route_id,
      r.route_name,
      r.source,
      r.destination,
      r.estimated_time,

      b.id AS bus_id,
      b.bus_number,
      b.capacity,
      b.driver_name

    FROM transport_requests tr

    LEFT JOIN routes r
      ON tr.route_id = r.id

    LEFT JOIN buses b
      ON tr.assigned_bus_id = b.id

    WHERE tr.student_id = ?
    AND tr.status = 'approved'

    ORDER BY tr.id DESC
    LIMIT 1
  `

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'DB Error',
      })
    }

    if (result.length === 0) {
      return res.json(null)
    }

    const route = result[0]

    db.query(
      `
      SELECT stop_name, latitude, longitude
      FROM route_stops
      WHERE route_id = ?
      ORDER BY stop_order ASC
    `,
      [route.route_id],
      (err, stops) => {
        if (err) {
          return res.status(500).json({
            message: 'Stops Error',
          })
        }

        route.stops = stops

        res.json(route)
      },
    )
  })
})
// ================= DEPARTURE ROUTE =================

app.get('/student-departure-route/:studentId', (req, res) => {
  const { studentId } = req.params;

  const sql = `
    SELECT
  r.id AS route_id,
  r.route_name,
  r.source,
  r.destination,
  r.estimated_time,

  b.id AS bus_id,
  b.bus_number

FROM transport_requests tr

JOIN routes r
ON tr.route_id = r.id

LEFT JOIN buses b
ON tr.assigned_bus_id = b.id

WHERE tr.student_id = ?
AND tr.status = 'approved'

ORDER BY tr.id DESC
LIMIT 1
  `;

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }

    if (result.length === 0) {
      return res.json(null);
    }

    const route = result[0];

    // GET STOPS
    db.query(
      `SELECT * FROM route_stops
       WHERE route_id = ?
       ORDER BY stop_order ASC`,
      [route.route_id],
      (err2, stops) => {
        if (err2) {
          return res.status(500).json({ message: err2.message });
        }

        // GET DEPARTURE TIMES
        db.query(
          `SELECT departure_time
           FROM departure_timings
           WHERE route_id = ?`,
          [route.route_id],
          (err3, timings) => {
            if (err3) {
              return res.status(500).json({ message: err3.message });
            }

            route.stops = stops;
            route.timings = timings;

            res.json(route);
          }
        );
      }
    );
  });
});

app.post('/add-complaint', (req, res) => {
  const {
    student_id,
    title,
    category,
    description,
  } = req.body;

  const query = `
    INSERT INTO complaints
    (
      student_id,
      title,
      category,
      description
    )
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    query,
    [student_id, title, category, description],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.json({
        success: true,
        message: 'Complaint submitted',
      });
    }
  );
});

app.get('/student-complaints/:studentId', (req, res) => {
  const { studentId } = req.params;

  const query = `
    SELECT *
    FROM complaints
    WHERE student_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json(results);
  });
});

app.get('/all-complaints', (req, res) => {
  const query = `
    SELECT
      c.*,
      s.reg_no,
      u.name,
      u.email
    FROM complaints c

    JOIN students s
    ON c.student_id = s.id

    JOIN users u
    ON s.user_id = u.id

    ORDER BY c.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json(results);
  });
});

app.post('/save-push-token', (req, res) => {
  const {
    user_id,
    driver_id,
    role,
    token,
  } = req.body

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'FCM token is required',
    })
  }

  if (role === 'driver') {
    const finalDriverId = driver_id || user_id

    if (!finalDriverId) {
      return res.status(400).json({
        success: false,
        message: 'Driver id is required',
      })
    }

    const query = `
      UPDATE drivers
      SET fcm_token = ?
      WHERE id = ?
    `

    db.query(query, [token, finalDriverId], err => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        })
      }

      return res.json({
        success: true,
        message: 'Driver push token saved',
      })
    })

    return
  }

  const query = `
    UPDATE users
    SET fcm_token = ?
    WHERE id = ?
  `

  db.query(query, [token, user_id], err => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    res.json({
      success: true,
      message: 'User push token saved',
    })
  })
})

app.post('/respond-complaint', async (req, res) => {

  const {
    complaint_id,
    response,
    status,
  } = req.body;

  const updateQuery = `
    UPDATE complaints
    SET
      admin_response = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    updateQuery,
    [response, status, complaint_id],
    async (err) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      // 🔥 GET FCM TOKEN
      const tokenQuery = `
        SELECT u.fcm_token
        FROM complaints c

        JOIN students s
        ON c.student_id = s.id

        JOIN users u
        ON s.user_id = u.id

        WHERE c.id = ?
      `;

      db.query(
        tokenQuery,
        [complaint_id],
        async (err, result) => {

          if (
            !err &&
            result.length > 0
          ) {

            const pushToken =
              result[0].fcm_token;

            if (pushToken) {

              try {
                console.log('🔥 PUSH TOKEN:', pushToken);
                await admin.messaging().send({

                  token: pushToken,

                  notification: {
                    title:
                      'Complaint Update',

                    body:
                      'Your complaint is registered. Admin will resolve your issue soon.',
                  },

                });

                console.log(
                  '🔥 Notification sent'
                );
                

              } catch (e) {

                console.log(
                  'FCM ERROR:',
                  e
                );
              }
            }
          }

          res.json({
            success: true,
            message: 'Response sent',
          });
        }
      );
    }
  );
});

app.get('/admin-dashboard-stats', (req, res) => {

  const stats = {};

  db.query(
    'SELECT COUNT(*) AS total_buses FROM buses',
    (err, busResult) => {

      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      stats.total_buses =
        busResult[0].total_buses;

      db.query(
        'SELECT COUNT(*) AS total_students FROM students',
        (err, studentResult) => {

          stats.total_students =
            studentResult[0].total_students;

          db.query(
            'SELECT COUNT(*) AS total_drivers FROM drivers',
            (err, driverResult) => {

              stats.total_drivers =
                driverResult[0].total_drivers;

              db.query(`SELECT COUNT(*) AS total_complaints
                      FROM complaints
                      WHERE status != 'resolved'
                      `,
                (err, complaintResult) => {

                  stats.total_complaints =
                    complaintResult[0].total_complaints;

                  res.json({
                    success: true,
                    stats,
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// ================= ADD DRIVER =================

app.post('/add-driver', (req, res) => {
  const {
    name,
    email,
    father_name,
    phone,
    cnic,
    joining_date,
  } = req.body

  if (
    !name ||
    !email ||
    !father_name ||
    !phone ||
    !cnic ||
    !joining_date
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all required fields',
    })
  }

  const tempPass =
    Math.random().toString(36).slice(-8)

  const checkQuery = `
    SELECT * FROM drivers
    WHERE cnic = ?
    OR phone = ?
    OR email = ?
  `

  db.query(
    checkQuery,
    [cnic, phone, email],
    (checkErr, checkResult) => {

      if (checkErr) {
        return res.status(500).json({
          success: false,
          message: checkErr.message,
        })
      }

      if (checkResult.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            'Driver already exists',
        })
      }

      const insertQuery = `
        INSERT INTO drivers (
          name,
          email,
          father_name,
          phone,
          cnic,
          joining_date,
          password,
          role,
          is_available
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      db.query(
        insertQuery,
        [
          name,
          email,
          father_name,
          phone,
          cnic,
          joining_date,
          tempPass,
          'driver',
          1,
        ],
        (err, result) => {

          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message,
            })
          }

          // SEND EMAIL
          transporter.sendMail(
            {
              from:
                'haseeb.ahmed20035@gmail.com',

              to: email,

              subject:
                'Driver Account Created 🚍',

              html: `
                <h2>🚍 UOL Transportation System</h2>

                <p>Hello <b>${name}</b>,</p>

                <p>
                  You have been assigned as a driver in UOL Transportation System.
                </p>

                <h3>Login Credentials</h3>

                <p><b>Email:</b> ${email}</p>

                <p><b>Password:</b> ${tempPass}</p>

                <p><b>Role:</b> driver</p>

                <p>
                  Please login using these credentials.
                </p>
                <p>You can change password from "My Personal Info"</p>

              `,
            },

            mailErr => {

              if (mailErr) {
                console.log(
                  'MAIL ERROR:',
                  mailErr
                )
              } else {
                console.log(
                  'DRIVER MAIL SENT'
                )
              }
            },
          )

          return res.status(200).json({
            success: true,
            message:
              'Driver added successfully',
            driver_id: result.insertId,
          })
        },
      )
    },
  )
})

// ================= DELETE DRIVER =================

app.delete('/delete-driver/:id', (req, res) => {

  const driverId = req.params.id;

  // REMOVE DRIVER FROM BUSES
  const updateBusQuery = `
    UPDATE buses
    SET
      driver_id = NULL,
      driver_name = NULL
    WHERE driver_id = ?
  `;

  db.query(
    updateBusQuery,
    [driverId],
    (updateErr) => {

      if (updateErr) {
        return res.status(500).json({
          success: false,
          message: updateErr.message,
        });
      }

      // DELETE DRIVER
      db.query(
        'DELETE FROM drivers WHERE id = ?',
        [driverId],
        (deleteErr) => {

          if (deleteErr) {
            return res.status(500).json({
              success: false,
              message: deleteErr.message,
            });
          }

          res.json({
            success: true,
            message:
              'Driver deleted successfully',
          });
        }
      );
    }
  );
});
// ================= ALL DRIVERS =================

app.get('/all-drivers', (req, res) => {

  const sql = `
    SELECT
      d.id,
      d.name,
      d.email,
      d.father_name,
      d.phone,
      d.cnic,
      d.joining_date,
      d.is_available,

      b.bus_number,
      b.route_name

    FROM drivers d

    LEFT JOIN buses b
    ON d.id = b.driver_id

    ORDER BY d.id DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.json(result);
  });
});

// ================= DRIVER PERSONAL INFO =================

app.get('/driver/:id', (req, res) => {

  const driverId = req.params.id;

  const sql = `
    SELECT
      id,
      name,
      email,
      father_name,
      phone,
      cnic,
      joining_date,
      is_available
    FROM drivers
    WHERE id = ?
  `;

  db.query(sql, [driverId], (err, result) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found',
      });
    }

    res.json(result[0]);
  });
});

app.get('/driver/my-route/:driverId', (req, res) => {
  const { driverId } = req.params;

  const query = `
    SELECT 
      d.id AS driver_id,
      d.name AS driver_name,

      b.id AS bus_id,
      b.bus_number,
      b.capacity,
      b.status AS bus_status,

      r.id AS route_id,
      r.route_name,
      r.source,
      r.destination,
      r.estimated_time,

      rs.id AS stop_id,
      rs.stop_name,
      rs.latitude,
      rs.longitude,
      rs.stop_order

    FROM drivers d
    LEFT JOIN buses b ON d.id = b.driver_id
    LEFT JOIN routes r ON b.route_id = r.id
    LEFT JOIN route_stops rs ON r.id = rs.route_id
    WHERE d.id = ?
    ORDER BY rs.stop_order ASC
  `;

  db.query(query, [driverId], (err, results) => {
    if (err) {
      console.log('Driver my route error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch driver route',
      });
    }

    if (!results.length || !results[0].route_id) {
      return res.status(404).json({
        success: false,
        message: 'No route assigned to this driver',
      });
    }

    const first = results[0];

    const routeData = {
      driver: {
        id: first.driver_id,
        name: first.driver_name,
      },
      bus: {
        id: first.bus_id,
        bus_number: first.bus_number,
        capacity: first.capacity,
        status: first.bus_status,
      },
      route: {
        id: first.route_id,
        route_name: first.route_name,
        source: first.source,
        destination: first.destination,
        estimated_time: first.estimated_time,
        stops: results
          .filter(row => row.stop_id)
          .map(row => ({
            id: row.stop_id,
            stop_name: row.stop_name,
            latitude: row.latitude,
            longitude: row.longitude,
            stop_order: row.stop_order,
          })),
      },
    };

    res.json({
      success: true,
      data: routeData,
    });
  });
});

// ================= TRIP CONTROL / LIVE TRACKING =================

app.post('/start-trip', (req, res) => {
  const {
    driver_id,
    bus_id,
    route_id,
    latitude,
    longitude,
  } = req.body

  if (
  !driver_id ||
  !bus_id ||
  !route_id ||
  latitude === undefined ||
  longitude === undefined
) {
    return res.status(400).json({
      success: false,
      message: 'Required trip data missing',
    })
  }

  const sql = `
    INSERT INTO bus_live_locations
    (bus_id, driver_id, route_id, latitude, longitude, status)
    VALUES (?, ?, ?, ?, ?, 'running')
  `

  db.query(
    sql,
    [bus_id, driver_id, route_id, latitude, longitude],
    err => {
      if (err) {
        console.log('START TRIP ERROR:', err)
        return res.status(500).json({
          success: false,
          message: err.message,
        })
      }

      db.query(
        `UPDATE buses SET status = 'running' WHERE id = ?`,
        [bus_id]
      )

      res.json({
        success: true,
        message: 'Trip started successfully',
      })
    }
  )
})

app.post('/update-bus-location', (req, res) => {
  const {
    driver_id,
    bus_id,
    route_id,
    latitude,
    longitude,
  } = req.body

  if (!driver_id || !bus_id || !route_id || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Location data missing',
    })
  }

  const sql = `
    INSERT INTO bus_live_locations
    (bus_id, driver_id, route_id, latitude, longitude, status)
    VALUES (?, ?, ?, ?, ?, 'running')
  `

  db.query(
    sql,
    [bus_id, driver_id, route_id, latitude, longitude],
    err => {
      if (err) {
        console.log('UPDATE BUS LOCATION ERROR:', err)
        return res.status(500).json({
          success: false,
          message: err.message,
        })
      }

      checkBusArrivalAndNotifyStudents(bus_id, route_id, latitude, longitude)

      res.json({
        success: true,
        message: 'Location updated',
      })
    }
  )
})

app.post('/end-trip', (req, res) => {
  const { driver_id, bus_id, route_id } = req.body

  if (!driver_id || !bus_id || !route_id) {
    return res.status(400).json({
      success: false,
      message: 'Trip data missing',
    })
  }

  db.query(
    `
    INSERT INTO bus_live_locations
    (bus_id, driver_id, route_id, latitude, longitude, status)
    SELECT ?, ?, ?, latitude, longitude, 'ended'
    FROM bus_live_locations
    WHERE bus_id = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [bus_id, driver_id, route_id, bus_id],
    err => {
      if (err) {
        console.log('END TRIP ERROR:', err)
        return res.status(500).json({
          success: false,
          message: err.message,
        })
      }

      db.query(
        `UPDATE buses SET status = 'active' WHERE id = ?`,
        [bus_id]
      )

      res.json({
        success: true,
        message: 'Trip ended successfully',
      })
    }
  )
})

// Admin can view all running buses
app.get('/admin/running-buses', (req, res) => {
  const sql = `
    SELECT 
      bll.bus_id,
      bll.driver_id,
      bll.route_id,
      bll.latitude,
      bll.longitude,
      bll.status,
      bll.updated_at,

      b.bus_number,
      b.driver_name,
      r.route_name,
      r.source,
      r.destination

    FROM bus_live_locations bll

    JOIN (
      SELECT bus_id, MAX(id) AS latest_id
      FROM bus_live_locations
      GROUP BY bus_id
    ) latest
    ON bll.id = latest.latest_id

    JOIN buses b
    ON bll.bus_id = b.id

    JOIN routes r
    ON bll.route_id = r.id

    WHERE bll.status = 'running'
    ORDER BY bll.updated_at DESC
  `

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    res.json({
      success: true,
      buses: result,
    })
  })
})

// Student can view only his assigned approved bus
app.get('/student/live-bus/:studentId', (req, res) => {
  const { studentId } = req.params

  const sql = `
    SELECT 
      bll.bus_id,
      bll.driver_id,
      bll.route_id,
      bll.latitude,
      bll.longitude,
      bll.status,
      bll.updated_at,

      b.bus_number,
      b.driver_name,
      r.route_name,
      r.source,
      r.destination,
      r.estimated_time

    FROM transport_requests tr

    JOIN bus_live_locations bll
    ON tr.assigned_bus_id = bll.bus_id

    JOIN (
      SELECT bus_id, MAX(id) AS latest_id
      FROM bus_live_locations
      GROUP BY bus_id
    ) latest
    ON bll.id = latest.latest_id

    JOIN buses b
    ON bll.bus_id = b.id

    JOIN routes r
    ON bll.route_id = r.id

    WHERE tr.student_id = ?
    AND tr.status = 'approved'
    AND bll.status = 'running'

    ORDER BY tr.id DESC
    LIMIT 1
  `

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    if (result.length === 0) {
      return res.json({
        success: false,
        message: 'No running bus found',
        bus: null,
      })
    }

    res.json({
      success: true,
      bus: result[0],
    })
  })
})

const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

const checkBusArrivalAndNotifyStudents = (
  busId,
  routeId,
  busLat,
  busLng
) => {
  const sql = `
    SELECT 
      tr.student_id,
      u.fcm_token,
      u.name,
      rs.stop_name,
      rs.latitude,
      rs.longitude

    FROM transport_requests tr

    JOIN students s
    ON tr.student_id = s.id

    JOIN users u
    ON s.user_id = u.id

    JOIN route_stops rs
    ON tr.route_id = rs.route_id

    WHERE tr.assigned_bus_id = ?
    AND tr.route_id = ?
    AND tr.status = 'approved'
    AND u.fcm_token IS NOT NULL
  `

  db.query(sql, [busId, routeId], async (err, students) => {
    if (err) {
      console.log('ARRIVAL CHECK ERROR:', err)
      return
    }

    for (const student of students) {
      const distance = getDistanceInMeters(
        Number(busLat),
        Number(busLng),
        Number(student.latitude),
        Number(student.longitude)
      )

      if (distance <= 80) {
        try {
          await admin.messaging().send({
            token: student.fcm_token,
            notification: {
              title: 'Bus Arrived',
              body: `Your bus has arrived at ${student.stop_name}. Be hurry.`,
            },
          })

          console.log('Arrival notification sent to:', student.name)
        } catch (e) {
          console.log('ARRIVAL FCM ERROR:', e)
        }
      }
    }
  })
}

// ================= ADMIN SEND NOTIFICATION =================

app.post('/admin/send-notification', async (req, res) => {
  const {
    title,
    message,
    target_role,
    created_by,
  } = req.body

  if (!title || !message || !target_role) {
    return res.status(400).json({
      success: false,
      message: 'Title, message and target role are required',
    })
  }

  const allowedRoles = ['all', 'student', 'driver']

  if (!allowedRoles.includes(target_role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid target role',
    })
  }

  const insertNotificationQuery = `
    INSERT INTO admin_notifications
    (title, message, target_role, created_by)
    VALUES (?, ?, ?, ?)
  `

  db.query(
    insertNotificationQuery,
    [title, message, target_role, created_by || null],
    (err, notificationResult) => {
      if (err) {
        console.log('ADMIN NOTIFICATION INSERT ERROR:', err)

        return res.status(500).json({
          success: false,
          message: err.message,
        })
      }

      const notificationId = notificationResult.insertId
      const receivers = []

      const fetchStudents = callback => {
        if (target_role !== 'all' && target_role !== 'student') {
          callback()
          return
        }

        const studentQuery = `
          SELECT
            CAST(id AS CHAR) AS notification_user_id,
            name,
            email,
            role,
            fcm_token
          FROM users
          WHERE role = 'student'
        `

        db.query(studentQuery, (studentErr, students) => {
          if (studentErr) {
            callback(studentErr)
            return
          }

          receivers.push(...students)
          callback()
        })
      }

      const fetchDrivers = callback => {
        if (target_role !== 'all' && target_role !== 'driver') {
          callback()
          return
        }

        const driverQuery = `
          SELECT
            CONCAT('driver_', id) AS notification_user_id,
            name,
            email,
            'driver' AS role,
            fcm_token
          FROM drivers
        `

        db.query(driverQuery, (driverErr, drivers) => {
          if (driverErr) {
            callback(driverErr)
            return
          }

          receivers.push(...drivers)
          callback()
        })
      }

      fetchStudents(studentErr => {
        if (studentErr) {
          return res.status(500).json({
            success: false,
            message: studentErr.message,
          })
        }

        fetchDrivers(driverErr => {
          if (driverErr) {
            return res.status(500).json({
              success: false,
              message: driverErr.message,
            })
          }

          if (receivers.length === 0) {
            return res.json({
              success: true,
              message: 'Notification saved, but no users found for selected role',
              notification_id: notificationId,
            })
          }

          const insertValues = receivers.map(user => [
            notificationId,
            user.notification_user_id,
            0,
          ])

          const insertUserNotificationQuery = `
            INSERT IGNORE INTO user_notifications
            (notification_id, user_id, is_read)
            VALUES ?
          `

          db.query(
            insertUserNotificationQuery,
            [insertValues],
            async userNotificationErr => {
              if (userNotificationErr) {
                console.log(
                  'USER NOTIFICATION INSERT ERROR:',
                  userNotificationErr
                )

                return res.status(500).json({
                  success: false,
                  message: userNotificationErr.message,
                })
              }

              const usersWithToken = receivers.filter(user => user.fcm_token)

              let sentCount = 0
              let failedCount = 0

              for (const user of usersWithToken) {
                try {
                  await admin.messaging().send({
                    token: user.fcm_token,
                    notification: {
                      title,
                      body: message,
                    },
                    data: {
                      notification_id: String(notificationId),
                      target_role: target_role,
                      type: 'admin_notification',
                    },
                  })

                  sentCount++
                } catch (fcmError) {
                  failedCount++

                  console.log(
                    'ADMIN NOTIFICATION FCM ERROR:',
                    user.email || user.name,
                    fcmError
                  )
                }
              }

              return res.json({
                success: true,
                message: 'Notification sent successfully',
                notification_id: notificationId,
                total_users: receivers.length,
                push_sent: sentCount,
                push_failed: failedCount,
              })
            }
          )
        })
      })
    }
  )
})


// ================= GET USER NOTIFICATIONS =================

app.get('/user-notifications/:userId', (req, res) => {
  const { userId } = req.params

  const query = `
    SELECT
      un.id AS user_notification_id,
      un.is_read,
      n.id AS notification_id,
      n.title,
      n.message,
      n.target_role,
      n.created_at
    FROM user_notifications un

    JOIN admin_notifications n
    ON un.notification_id = n.id

    WHERE un.user_id = ?

    ORDER BY n.created_at DESC
  `

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.log('GET USER NOTIFICATIONS ERROR:', err)

      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    res.json({
      success: true,
      notifications: result,
    })
  })
})


// ================= MARK NOTIFICATION READ =================

app.put('/user-notifications/read/:id', (req, res) => {
  const { id } = req.params

  const query = `
    UPDATE user_notifications
    SET is_read = 1
    WHERE id = ?
  `

  db.query(query, [id], err => {
    if (err) {
      console.log('MARK NOTIFICATION READ ERROR:', err)

      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
    })
  })
})


// ================= UNREAD NOTIFICATION COUNT =================

app.get('/user-notifications/unread-count/:userId', (req, res) => {
  const { userId } = req.params

  const query = `
    SELECT COUNT(*) AS unread_count
    FROM user_notifications
    WHERE user_id = ?
    AND is_read = 0
  `

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.log('UNREAD NOTIFICATION COUNT ERROR:', err)

      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    res.json({
      success: true,
      unread_count: result[0].unread_count,
    })
  })
})

app.delete('/clear-user-notifications/:userId', (req, res) => {
  const { userId } = req.params

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User id is required',
    })
  }

  const query = `
    DELETE FROM user_notifications
    WHERE user_id = ?
  `

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.log('Clear notifications error:', err)
      return res.status(500).json({
        success: false,
        message: 'Failed to clear notifications',
      })
    }

    return res.json({
      success: true,
      message: 'Notifications cleared successfully',
      deletedCount: result.affectedRows,
    })
  })
})
// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
