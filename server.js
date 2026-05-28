const db = require('./config/db')
const admin = require('./config/firebase')
const express = require('express')
const cors = require('cors')
const transporter = require('./config/mail')
const cron = require('node-cron')
const app = express()
require("dotenv").config();
const PDFDocument = require('pdfkit')

app.use(cors())
app.use(express.json())

// auth routes
app.use('/api/auth', require('./routes/authRoutes'))

const PORT = process.env.PORT || 5000;

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
      'INSERT INTO route_stops (route_id, stop_name, latitude, longitude, stop_order) VALUES (?, ?, ?, ?, ?)',
      [
        routeId,
        stop.stop_name,
        Number(stop.latitude),
        Number(stop.longitude),
        index + 1   // 🔥 Save the order based on array position
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

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with expiry time
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };

  // Send response immediately to frontend
  res.json({
    success: true,
    message: "OTP is being sent to your email",
  });

  // Send email in background
  transporter.sendMail(
    {
      from: "haseeb.ahmed20035@gmail.com",
      to: email,
      subject: "OTP Verification",
      html: `
        <h2>UOL Transportation App</h2>
        <p>Your OTP for changing password is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    },
    err => {
      if (err) {
        console.log("OTP MAIL ERROR:", err);
      } else {
        console.log("OTP MAIL SENT SUCCESSFULLY TO:", email);
      }
    }
  );
});

app.post("/change-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP and new password are required",
    });
  }

  const savedOtpData = otpStore[email];

  if (!savedOtpData) {
    return res.status(400).json({
      success: false,
      message: "OTP not found. Please request a new OTP.",
    });
  }

  if (Date.now() > savedOtpData.expiresAt) {
    delete otpStore[email];

    return res.status(400).json({
      success: false,
      message: "OTP expired. Please request a new OTP.",
    });
  }

  if (savedOtpData.otp !== otp.toString()) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  db.query(
    "UPDATE users SET password = ? WHERE email = ?",
    [newPassword, email],
    err => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "DB error",
        });
      }

      delete otpStore[email];

      res.json({
        success: true,
        message: "Password updated successfully",
      });
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
  const { student_id, route_id, student_stop_id } = req.body

  if (!student_id || !route_id) {
    return res.status(400).json({
      message: 'Student and route are required',
    })
  }

  const sql = `
    INSERT INTO transport_requests
    (student_id, route_id, student_stop_id)
    VALUES (?, ?, ?)
  `

  db.query(
    sql,
    [student_id, route_id, student_stop_id || null],
    (err, result) => {
      if (err) {
        console.log(err)

        return res.status(500).json({
          message: 'DB Error',
        })
      }

      res.json({
        message: 'Transport request submitted successfully',
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
                // await admin.messaging().send({

                //   token: pushToken,

                //   notification: {
                //     title:
                //       'Complaint Update',

                //     body:
                //       'Your complaint is registered. Admin will resolve your issue soon.',
                //   },

                // });

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

  if (!driver_id ||!bus_id || !route_id || latitude === undefined || longitude === undefined || latitude === null ||longitude === null) {
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

      checkBusDelayAndArrivalAndNotifyStudents(
  bus_id,
  route_id,
  latitude,
  longitude,
)

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
      tr.id AS request_id,
      tr.student_id,
      tr.route_id AS approved_route_id,
      tr.assigned_bus_id,

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
      AND tr.assigned_bus_id IS NOT NULL
      AND bll.status = 'running'

    ORDER BY tr.id DESC
    LIMIT 1
  `

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.log('STUDENT LIVE BUS ERROR:', err)
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
        studentStop: null,
        routeStops: [],
      })
    }

    const bus = result[0]

    const stopsSql = `
      SELECT 
        id,
        stop_name,
        latitude,
        longitude,
        stop_order
      FROM route_stops
      WHERE route_id = ?
      ORDER BY stop_order ASC
    `

    db.query(stopsSql, [bus.route_id], (stopErr, stops) => {
      if (stopErr) {
        console.log('LIVE BUS STOPS ERROR:', stopErr)
        return res.status(500).json({
          success: false,
          message: stopErr.message,
        })
      }

      const formattedStops = Array.isArray(stops) ? stops : []

      // For now using first stop as student stop.
      // Later you can store student's selected stop in transport_requests.
      const studentStop = formattedStops[0] || null

      return res.json({
        success: true,
        bus,
        studentStop,
        routeStops: formattedStops,
      })
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

const sendPushNotification = async ({
  token,
  title,
  body,
  type = 'general',
  data = {},
}) => {
  if (!token) return false

  try {
    await admin.messaging().send({
      token,

      notification: {
        title,
        body,
      },

      data: {
        title: String(title),
        body: String(body),
        type: String(type),
        ...Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            String(value ?? ''),
          ]),
        ),
      },

      android: {
        priority: 'high',
        notification: {
          channelId: 'uol_transport_alerts',
        },
      },
    })

    return true
  } catch (error) {
    console.log('FCM SEND ERROR:', error.message || error)
    return false
  }
}

const hasAlreadySentBusAlert = ({
  busId,
  routeId,
  studentId,
  alertType,
}) => {
  return new Promise(resolve => {
    const query = `
      SELECT id
      FROM bus_student_alerts
      WHERE bus_id = ?
      AND route_id = ?
      AND student_id = ?
      AND alert_type = ?
      AND trip_date = CURDATE()
      LIMIT 1
    `

    db.query(
      query,
      [busId, routeId, studentId, alertType],
      (err, rows) => {
        if (err) {
          console.log('CHECK BUS ALERT ERROR:', err)
          return resolve(true)
        }

        resolve(rows.length > 0)
      },
    )
  })
}

const markBusAlertSent = ({
  busId,
  routeId,
  studentId,
  alertType,
}) => {
  return new Promise(resolve => {
    const query = `
      INSERT IGNORE INTO bus_student_alerts
      (bus_id, route_id, student_id, alert_type, trip_date)
      VALUES (?, ?, ?, ?, CURDATE())
    `

    db.query(
      query,
      [busId, routeId, studentId, alertType],
      err => {
        if (err) {
          console.log('MARK BUS ALERT ERROR:', err)
          return resolve(false)
        }

        resolve(true)
      },
    )
  })
}

const getTripElapsedMinutes = ({ busId, routeId }) => {
  return new Promise(resolve => {
    const query = `
      SELECT TIMESTAMPDIFF(MINUTE, MIN(updated_at), NOW()) AS elapsed_minutes
      FROM bus_live_locations
      WHERE bus_id = ?
      AND route_id = ?
      AND status = 'running'
      AND DATE(updated_at) = CURDATE()
    `

    db.query(query, [busId, routeId], (err, rows) => {
      if (err) {
        console.log('TRIP ELAPSED ERROR:', err)
        return resolve(0)
      }

      resolve(Number(rows?.[0]?.elapsed_minutes || 0))
    })
  })
}

const saveStudentSystemNotification = ({
  userId,
  title,
  message,
}) => {
  return new Promise(resolve => {
    const insertNotificationQuery = `
      INSERT INTO admin_notifications
      (title, message, target_role, created_by)
      VALUES (?, ?, 'student', NULL)
    `

    db.query(
      insertNotificationQuery,
      [title, message],
      (err, notificationResult) => {
        if (err) {
          console.log('SYSTEM NOTIFICATION INSERT ERROR:', err)
          return resolve(false)
        }

        const notificationId = notificationResult.insertId

        const insertUserNotificationQuery = `
          INSERT INTO user_notifications
          (notification_id, user_id, is_read)
          VALUES (?, ?, 0)
        `

        db.query(
          insertUserNotificationQuery,
          [notificationId, String(userId)],
          err2 => {
            if (err2) {
              console.log('SYSTEM USER NOTIFICATION ERROR:', err2)
              return resolve(false)
            }

            resolve(true)
          },
        )
      },
    )
  })
}

const checkBusDelayAndArrivalAndNotifyStudents = async (
  busId,
  routeId,
  busLat,
  busLng,
) => {
  const elapsedMinutes = await getTripElapsedMinutes({
    busId,
    routeId,
  })

  const delayThresholdMinutes = 35
  const arrivalDistanceMeters = 80

  const sql = `
    SELECT 
      tr.student_id,
      s.user_id,
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
      ON rs.id = COALESCE(
        tr.student_stop_id,
        (
          SELECT rs2.id
          FROM route_stops rs2
          WHERE rs2.route_id = tr.route_id
          ORDER BY rs2.stop_order ASC
          LIMIT 1
        )
      )

    WHERE tr.assigned_bus_id = ?
    AND tr.route_id = ?
    AND tr.status = 'approved'
    AND u.fcm_token IS NOT NULL
  `

  db.query(sql, [busId, routeId], async (err, students) => {
    if (err) {
      console.log('BUS ALERT CHECK ERROR:', err)
      return
    }

    for (const student of students) {
      const studentId = student.student_id
      const userId = student.user_id

      if (elapsedMinutes >= delayThresholdMinutes) {
        const alreadyDelaySent = await hasAlreadySentBusAlert({
          busId,
          routeId,
          studentId,
          alertType: 'delay',
        })

        if (!alreadyDelaySent) {
          const title = 'Bus Delayed'
          const body =
            'Sorry for the delay. Your bus is arriving soon.'

          await sendPushNotification({
            token: student.fcm_token,
            title,
            body,
            type: 'bus_delay',
            data: {
              bus_id: busId,
              route_id: routeId,
              elapsed_minutes: elapsedMinutes,
            },
          })

          await saveStudentSystemNotification({
            userId,
            title,
            message: body,
          })

          await markBusAlertSent({
            busId,
            routeId,
            studentId,
            alertType: 'delay',
          })
        }
      }

      const distance = getDistanceInMeters(
        Number(busLat),
        Number(busLng),
        Number(student.latitude),
        Number(student.longitude),
      )

      if (distance <= arrivalDistanceMeters) {
        const alreadyArrivalSent = await hasAlreadySentBusAlert({
          busId,
          routeId,
          studentId,
          alertType: 'arrived',
        })

        if (!alreadyArrivalSent) {
          const title = 'Bus Arrived'
          const body = `Your bus has arrived at ${student.stop_name}.`

          await sendPushNotification({
            token: student.fcm_token,
            title,
            body,
            type: 'bus_arrived',
            data: {
              bus_id: busId,
              route_id: routeId,
              stop_name: student.stop_name,
              distance_meters: Math.round(distance),
            },
          })

          await saveStudentSystemNotification({
            userId,
            title,
            message: body,
          })

          await markBusAlertSent({
            busId,
            routeId,
            studentId,
            alertType: 'arrived',
          })
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
  const sent = await sendPushNotification({
    token: user.fcm_token,
    title,
    body: message,
    type: 'admin_notification',
    data: {
      notification_id: notificationId,
      target_role,
      receiver_id: user.notification_user_id,
    },
  })

  if (sent) {
    sentCount++
  } else {
    failedCount++
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

// ================= FEE VOUCHER SYSTEM =================
const TAX_RATE = 0.16

const billingCycleLabels = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  six_months: '6 Months',
  yearly: 'Yearly',
}

const billingCycleMultipliers = {
  monthly: 1,
  quarterly: 3,
  six_months: 6,
  yearly: 12,
}

const calculateFeeAmounts = (baseAmount, billingCycle) => {
  const multiplier = billingCycleMultipliers[billingCycle] || 1

  const subtotal = Number(baseAmount) * multiplier
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  }
}

const formatMoney = value => {
  return `PKR ${Number(value || 0).toLocaleString()}`
}

const formatDate = value => {
  if (!value) return '-'
  return String(value).slice(0, 10)
}

const APP_PUBLIC_URL =
  process.env.APP_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`

const sendMailSafe = ({ to, subject, html }) => {
  return new Promise(resolve => {
    if (!to) return resolve(false)

    transporter.sendMail(
      {
        from: 'haseeb.ahmed20035@gmail.com',
        to,
        subject,
        html,
      },
      err => {
        if (err) {
          console.log('FEE MAIL ERROR:', err.message)
          return resolve(false)
        }

        console.log('FEE MAIL SENT TO:', to)
        resolve(true)
      }
    )
  })
}

const getFeeVoucherEmailHtml = ({
  studentName,
  title,
  amount,
  dueDate,
  message,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>🚍 UOL Transportation Fee Voucher</h2>

      <p>Hello <b>${studentName || 'Student'}</b>,</p>

      <p>Your new fee voucher has been issued.</p>

      <table style="border-collapse: collapse; width: 100%; max-width: 520px;">
        <tr>
          <td style="border:1px solid #ddd;padding:8px;">Title</td>
          <td style="border:1px solid #ddd;padding:8px;"><b>${title}</b></td>
        </tr>

        <tr>
          <td style="border:1px solid #ddd;padding:8px;">Amount</td>
          <td style="border:1px solid #ddd;padding:8px;"><b>PKR ${amount}</b></td>
        </tr>

        <tr>
          <td style="border:1px solid #ddd;padding:8px;">Due Date</td>
          <td style="border:1px solid #ddd;padding:8px;">${dueDate}</td>
        </tr>
      </table>

      ${message ? `<p>${message}</p>` : ''}

      <p>Please open the UOL Transportation App and pay your fee before the due date.</p>
    </div>
  `
}

const getFeeReminderEmailHtml = ({
  studentName,
  title,
  amount,
  dueDate,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>🚨 Fee Payment Reminder</h2>

      <p>Hello <b>${studentName || 'Student'}</b>,</p>

      <p>Your fee voucher is still unpaid.</p>

      <p><b>Voucher:</b> ${title}</p>
      <p><b>Amount:</b> PKR ${amount}</p>
      <p><b>Due Date:</b> ${dueDate}</p>

      <p>Please open the UOL Transportation App and complete your payment.</p>
    </div>
  `
}

// Admin: get students for fee screen
app.get('/fee/students', (req, res) => {
  const sql = `
    SELECT
      s.id AS student_id,
      u.id AS user_id,
      u.name,
      u.email,
      s.reg_no,
      s.department,
      s.status
    FROM students s
    JOIN users u
      ON s.user_id = u.id
    WHERE s.status = 'active'
    ORDER BY s.id DESC
  `

  db.query(sql, (err, result) => {
    if (err) {
      console.log('FEE STUDENTS ERROR:', err)
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    res.json({
      success: true,
      students: result,
    })
  })
})

// Admin: send fee voucher to all or selected students
app.post('/fee/send-vouchers', (req, res) => {
  const {
  title,
  amount,
  due_date,
  message,
  send_to_all,
  student_ids,
  created_by,
} = req.body

  if (!title || !amount || !due_date) {
  return res.status(400).json({
    success: false,
    message: 'Title, amount and due date are required',
  })
}

  if (!send_to_all && (!Array.isArray(student_ids) || student_ids.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Please select at least one student',
    })
  }

  const insertVoucherSql = `
    INSERT INTO fee_vouchers
    (title, amount, due_date, message, created_by)
    VALUES (?, ?, ?, ?, ?)
  `

  db.query(
    insertVoucherSql,
    [
      title,
      Number(amount),
      due_date,
      message || null,
      created_by || null,
    ],
    (voucherErr, voucherResult) => {
      if (voucherErr) {
        console.log('CREATE FEE VOUCHER ERROR:', voucherErr)
        return res.status(500).json({
          success: false,
          message: voucherErr.message,
        })
      }

      const voucherId = voucherResult.insertId

      let studentsSql = `
        SELECT
          s.id AS student_id,
          u.name,
          u.email,
          s.reg_no,
          s.department
        FROM students s
        JOIN users u
          ON s.user_id = u.id
        WHERE s.status = 'active'
      `

      const params = []

      if (!send_to_all) {
        studentsSql += ` AND s.id IN (?)`
        params.push(student_ids)
      }

      db.query(studentsSql, params, (studentsErr, students) => {
        if (studentsErr) {
          console.log('FETCH VOUCHER STUDENTS ERROR:', studentsErr)
          return res.status(500).json({
            success: false,
            message: studentsErr.message,
          })
        }

        if (!students.length) {
          return res.status(404).json({
            success: false,
            message: 'No students found',
          })
        }

        const values = students.map(student => [
          voucherId,
          student.student_id,
          'unpaid',
        ])

        const assignSql = `
          INSERT IGNORE INTO fee_voucher_students
          (voucher_id, student_id, status)
          VALUES ?
        `

        db.query(assignSql, [values], async assignErr => {
          if (assignErr) {
            console.log('ASSIGN VOUCHER ERROR:', assignErr)
            return res.status(500).json({
              success: false,
              message: assignErr.message,
            })
          }

          for (const student of students) {
            await sendMailSafe({
              to: student.email,
              subject: `Fee Voucher Issued - ${title}`,
              html: getFeeVoucherEmailHtml({
              studentName: student.name,
              title,
              amount,
              dueDate: due_date,
              message,
            }),
            })
          }

          res.json({
            success: true,
            message: `Fee voucher sent to ${students.length} student(s)`,
            voucher_id: voucherId,
            total_students: students.length,
          })
        })
      })
    }
  )
})

// Admin: see all vouchers with paid/unpaid count
app.get('/fee/admin-vouchers', (req, res) => {
  const sql = `
    SELECT
      fv.id,
      fv.title,
      fv.amount,
      fv.due_date,
      fv.message,
      fv.created_at,

      COUNT(fvs.id) AS total_students,
      SUM(CASE WHEN fvs.status = 'paid' THEN 1 ELSE 0 END) AS paid_count,
      SUM(CASE WHEN fvs.status != 'paid' THEN 1 ELSE 0 END) AS unpaid_count

    FROM fee_vouchers fv
    LEFT JOIN fee_voucher_students fvs
      ON fvs.voucher_id = fv.id
    GROUP BY fv.id
    ORDER BY fv.id DESC
  `

  db.query(sql, (err, result) => {
    if (err) {
      console.log('ADMIN FEE VOUCHERS ERROR:', err)
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    res.json({
      success: true,
      vouchers: result,
    })
  })
})

// Admin: see students status for one voucher
app.get('/fee/voucher-students/:voucherId', (req, res) => {
  const { voucherId } = req.params

  const sql = `
    SELECT
      fvs.id AS voucher_student_id,
      fvs.status,
      fvs.paid_at,
      fvs.reminder_count,
      fvs.last_reminder_at,
      fvs.selected_billing_cycle,
      fvs.subtotal_amount,
      fvs.tax_amount,
      fvs.total_amount,

      s.id AS student_id,
      s.reg_no,
      s.department,

      u.name,
      u.email,

      fv.title,
      fv.amount,
      fv.due_date

    FROM fee_voucher_students fvs
    JOIN fee_vouchers fv
      ON fv.id = fvs.voucher_id
    JOIN students s
      ON s.id = fvs.student_id
    JOIN users u
      ON u.id = s.user_id
    WHERE fvs.voucher_id = ?
    ORDER BY fvs.status ASC, u.name ASC
  `

  db.query(sql, [voucherId], (err, result) => {
    if (err) {
      console.log('VOUCHER STUDENTS ERROR:', err)
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    res.json({
      success: true,
      students: result,
    })
  })
})

// Student: get own fee vouchers
app.get('/fee/student-vouchers/:studentId', (req, res) => {
  const { studentId } = req.params

  const sql = `
    SELECT
      fvs.id AS voucher_student_id,
      fvs.status,
      fvs.paid_at,
      fvs.reminder_count,
      fvs.selected_billing_cycle,
      fvs.subtotal_amount,
      fvs.tax_amount,
      fvs.total_amount,

      fv.id AS voucher_id,
      fv.title,
      fv.amount,
      fv.due_date,
      fv.message,
      fv.created_at

    FROM fee_voucher_students fvs
    JOIN fee_vouchers fv
      ON fv.id = fvs.voucher_id
    WHERE fvs.student_id = ?
    ORDER BY fv.id DESC
  `

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.log('STUDENT FEE VOUCHERS ERROR:', err)
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    res.json({
      success: true,
      vouchers: result,
    })
  })
})

// Student: start payment
app.post('/fee/voucher/:voucherStudentId/pay', (req, res) => {
  const { voucherStudentId } = req.params
  const { payment_method, billing_cycle } = req.body

  const allowedCycles = ['monthly', 'quarterly', 'six_months', 'yearly']

  if (!allowedCycles.includes(billing_cycle)) {
    return res.status(400).json({
      success: false,
      message: 'Please select a valid payment plan',
    })
  }

  const sql = `
    SELECT
      fvs.id AS voucher_student_id,
      fvs.student_id,
      fvs.status,

      fv.id AS voucher_id,
      fv.title,
      fv.amount

    FROM fee_voucher_students fvs
    JOIN fee_vouchers fv
      ON fv.id = fvs.voucher_id
    WHERE fvs.id = ?
    LIMIT 1
  `

  db.query(sql, [voucherStudentId], (err, rows) => {
    if (err) {
      console.log('PAYMENT FETCH ERROR:', err)
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found',
      })
    }

    const voucher = rows[0]

    if (voucher.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This voucher is already paid',
      })
    }

    const amounts = calculateFeeAmounts(voucher.amount, billing_cycle)

    const transactionRef = `FEE-${Date.now()}-${Math.floor(Math.random() * 100000)}`

    const insertPaymentSql = `
      INSERT INTO fee_payments
      (
        voucher_student_id,
        student_id,
        voucher_id,
        amount,
        selected_billing_cycle,
        subtotal_amount,
        tax_amount,
        total_amount,
        transaction_ref,
        gateway,
        payment_method,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `

    db.query(
      insertPaymentSql,
      [
        voucher.voucher_student_id,
        voucher.student_id,
        voucher.voucher_id,
        amounts.total,
        billing_cycle,
        amounts.subtotal,
        amounts.tax,
        amounts.total,
        transactionRef,
        process.env.PAYMENT_MODE || 'demo',
        payment_method || 'hosted_checkout',
      ],
      paymentErr => {
        if (paymentErr) {
          console.log('CREATE PAYMENT ERROR:', paymentErr)
          return res.status(500).json({
            success: false,
            message: paymentErr.message,
          })
        }

        const saveSelectionSql = `
          UPDATE fee_voucher_students
          SET
            selected_billing_cycle = ?,
            subtotal_amount = ?,
            tax_amount = ?,
            total_amount = ?
          WHERE id = ?
        `

        db.query(
          saveSelectionSql,
          [
            billing_cycle,
            amounts.subtotal,
            amounts.tax,
            amounts.total,
            voucher.voucher_student_id,
          ],
          selectionErr => {
            if (selectionErr) {
              console.log('SAVE SELECTED PLAN ERROR:', selectionErr)
              return res.status(500).json({
                success: false,
                message: selectionErr.message,
              })
            }

            const checkoutUrl = `${APP_PUBLIC_URL}/fee/demo-payment-success/${transactionRef}`

            res.json({
              success: true,
              message: 'Payment checkout created',
              transaction_ref: transactionRef,
              checkout_url: checkoutUrl,
              billing_cycle,
              subtotal_amount: amounts.subtotal,
              tax_amount: amounts.tax,
              total_amount: amounts.total,
            })
          }
        )
      }
    )
  })
})

// Demo payment success page
app.get('/fee/demo-payment-success/:transactionRef', (req, res) => {
  const { transactionRef } = req.params

  const paymentSql = `
    SELECT *
    FROM fee_payments
    WHERE transaction_ref = ?
    LIMIT 1
  `

  db.query(paymentSql, [transactionRef], (err, rows) => {
    if (err) {
      console.log('DEMO PAYMENT ERROR:', err)
      return res.status(500).send('Payment failed')
    }

    if (!rows.length) {
      return res.status(404).send('Payment not found')
    }

    const payment = rows[0]

    if (payment.status === 'paid') {
      return res.send(`
        <html>
          <body style="font-family:Arial;text-align:center;padding:40px;">
            <h2 style="color:green;">Already Paid</h2>
            <p>This voucher is already marked as paid.</p>
          </body>
        </html>
      `)
    }

    db.beginTransaction(txErr => {
      if (txErr) {
        return res.status(500).send('Transaction failed')
      }

      const updatePaymentSql = `
        UPDATE fee_payments
        SET
          status = 'paid',
          paid_at = NOW(),
          gateway_response = ?
        WHERE transaction_ref = ?
      `

      db.query(
        updatePaymentSql,
        [
          JSON.stringify({
            mode: 'demo',
            status: 'paid',
            transaction_ref: transactionRef,
          }),
          transactionRef,
        ],
        payErr => {
          if (payErr) {
            return db.rollback(() => {
              res.status(500).send('Payment update failed')
            })
          }

          const updateVoucherSql = `
            UPDATE fee_voucher_students
            SET
              status = 'paid',
              paid_at = NOW(),
              selected_billing_cycle = ?,
              subtotal_amount = ?,
              tax_amount = ?,
              total_amount = ?
            WHERE id = ?
          `

          db.query(
          updateVoucherSql,
          [
            payment.selected_billing_cycle,
            payment.subtotal_amount,
            payment.tax_amount,
            payment.total_amount,
            payment.voucher_student_id,
          ],
          voucherErr => {
            if (voucherErr) {
              return db.rollback(() => {
                res.status(500).send('Voucher update failed')
              })
            }

            db.commit(commitErr => {
              if (commitErr) {
                return db.rollback(() => {
                  res.status(500).send('Commit failed')
                })
              }

              res.send(`
                <html>
                  <body style="font-family:Arial;text-align:center;padding:40px;">
                    <h2 style="color:green;">Payment Successful</h2>
                    <p>Your fee voucher has been marked as paid.</p>
                    <p>You can close this page and return to the app.</p>
                  </body>
                </html>
              `)
            })
          })
        }
      )
    })
  })
})

// Admin: manually send reminders
app.post('/fee/send-reminders', (req, res) => {
  sendFeeReminders()
    .then(count => {
      res.json({
        success: true,
        message: `Reminder emails sent to ${count} unpaid student(s)`,
      })
    })
    .catch(error => {
      console.log('SEND REMINDERS ERROR:', error)
      res.status(500).json({
        success: false,
        message: error.message,
      })
    })
})

const sendFeeReminders = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        fvs.id AS voucher_student_id,
        fvs.reminder_count,

        fv.title,
        fv.amount,
        fv.due_date,

        u.name AS student_name,
        u.email AS student_email

      FROM fee_voucher_students fvs
      JOIN fee_vouchers fv
        ON fv.id = fvs.voucher_id
      JOIN students s
        ON s.id = fvs.student_id
      JOIN users u
        ON u.id = s.user_id

      WHERE fvs.status != 'paid'
        AND fv.due_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)
        AND (
          fvs.last_reminder_at IS NULL
          OR DATE(fvs.last_reminder_at) < CURDATE()
        )
    `

    db.query(sql, async (err, rows) => {
      if (err) return reject(err)

      let sentCount = 0

      for (const row of rows) {
        const sent = await sendMailSafe({
          to: row.student_email,
          subject: `Fee Reminder - ${row.title}`,
          html: getFeeReminderEmailHtml({
            studentName: row.student_name,
            title: row.title,
            amount: row.amount,
            dueDate: row.due_date,
          }),
        })

        if (sent) {
          sentCount++

          db.query(
            `
            UPDATE fee_voucher_students
            SET
              reminder_count = reminder_count + 1,
              last_reminder_at = NOW()
            WHERE id = ?
            `,
            [row.voucher_student_id]
          )
        }
      }

      resolve(sentCount)
    })
  })
}

// Automatic reminder every day at 9 AM server time
cron.schedule('0 9 * * *', async () => {
  try {
    const count = await sendFeeReminders()
    console.log(`Fee reminder cron completed. Emails sent: ${count}`)
  } catch (error) {
    console.log('Fee reminder cron failed:', error.message)
  }
})

app.get('/fee/voucher/:voucherStudentId/pdf', (req, res) => {
  const { voucherStudentId } = req.params
  const requestedCycle = req.query.billing_cycle

  const allowedCycles = ['monthly', 'quarterly', 'six_months', 'yearly']

  const sql = `
    SELECT
      fvs.id AS voucher_student_id,
      fvs.status,
      fvs.paid_at,
      fvs.selected_billing_cycle,
      fvs.subtotal_amount,
      fvs.tax_amount,
      fvs.total_amount,

      fv.id AS voucher_id,
      fv.title,
      fv.amount AS base_amount,
      fv.due_date,
      fv.message,
      fv.created_at,

      s.id AS student_id,
      s.reg_no,
      s.department,

      u.name AS student_name,
      u.email AS student_email,

      tr.id AS transport_request_id,
      tr.approved_at,

      r.id AS route_id,
      r.route_name,
      r.source,
      r.destination,
      r.estimated_time,

      b.bus_number,
      b.driver_name,
      b.capacity

    FROM fee_voucher_students fvs

    JOIN fee_vouchers fv
      ON fv.id = fvs.voucher_id

    JOIN students s
      ON s.id = fvs.student_id

    JOIN users u
      ON u.id = s.user_id

    LEFT JOIN transport_requests tr
      ON tr.student_id = s.id
      AND tr.status = 'approved'

    LEFT JOIN routes r
      ON r.id = tr.route_id

    LEFT JOIN buses b
      ON b.id = tr.assigned_bus_id

    WHERE fvs.id = ?

    ORDER BY tr.id DESC
    LIMIT 1
  `

  db.query(sql, [voucherStudentId], (err, rows) => {
    if (err) {
      console.log('PDF VOUCHER FETCH ERROR:', err)
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found',
      })
    }

    const data = rows[0]

    let finalCycle =
      data.selected_billing_cycle ||
      requestedCycle ||
      'monthly'

    if (!allowedCycles.includes(finalCycle)) {
      finalCycle = 'monthly'
    }

    const calculated = calculateFeeAmounts(data.base_amount, finalCycle)

    const subtotal =
      Number(data.subtotal_amount) > 0
        ? Number(data.subtotal_amount)
        : calculated.subtotal

    const tax =
      Number(data.tax_amount) > 0
        ? Number(data.tax_amount)
        : calculated.tax

    const total =
      Number(data.total_amount) > 0
        ? Number(data.total_amount)
        : calculated.total

    const stopsSql = `
      SELECT stop_name
      FROM route_stops
      WHERE route_id = ?
      ORDER BY stop_order ASC
    `

    db.query(stopsSql, [data.route_id], (stopsErr, stops) => {
      if (stopsErr) {
        console.log('PDF STOPS ERROR:', stopsErr)
        return res.status(500).json({
          success: false,
          message: stopsErr.message,
        })
      }

      const fileName = `UOL-Fee-Voucher-${data.reg_no || data.student_id}.pdf`

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      )

      const doc = new PDFDocument({
        size: 'A4',
        margin: 45,
      })

      doc.pipe(res)

      // Header background
      doc
        .rect(0, 0, 595, 115)
        .fill('#175812')

      doc
        .fillColor('#FFFFFF')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('UOL Transportation App', 45, 32)

      doc
        .fontSize(13)
        .font('Helvetica')
        .text('Official Fee Voucher', 45, 62)

      doc
        .fontSize(10)
        .text(`Voucher No: UOL-FEE-${data.voucher_student_id}`, 390, 35)
        .text(`Issue Date: ${formatDate(data.created_at)}`, 390, 55)
        .text(`Due Date: ${formatDate(data.due_date)}`, 390, 75)

      // Status badge
      const statusColor = data.status === 'paid' ? '#219653' : '#F2994A'

      doc
        .roundedRect(45, 135, 505, 38, 10)
        .fill('#F4F8F4')

      doc
        .fillColor('#175812')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text(data.title || 'Transport Fee Voucher', 60, 147)

      doc
        .fillColor(statusColor)
        .fontSize(11)
        .text(String(data.status || 'unpaid').toUpperCase(), 470, 148)

      // Student info
      let y = 200

      doc
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .fontSize(15)
        .text('Student Information', 45, y)

      y += 25

      const infoRow = (label, value, x1, x2, yy) => {
        doc
          .fillColor('#6B7280')
          .font('Helvetica-Bold')
          .fontSize(9)
          .text(label, x1, yy)

        doc
          .fillColor('#111827')
          .font('Helvetica')
          .fontSize(11)
          .text(value || '-', x2, yy)
      }

      infoRow('Name', data.student_name, 45, 135, y)
      infoRow('Reg No', data.reg_no, 330, 420, y)

      y += 22
      infoRow('Email', data.student_email, 45, 135, y)
      infoRow('Department', data.department, 330, 420, y)

      // Route info
      y += 45

      doc
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .fontSize(15)
        .text('Selected Route Information', 45, y)

      y += 25

      infoRow('Route Name', data.route_name, 45, 135, y)
      infoRow('Bus Number', data.bus_number, 330, 420, y)

      y += 22
      infoRow('Source', data.source, 45, 135, y)
      infoRow('Destination', data.destination, 330, 420, y)

      y += 22
      infoRow('Estimated Time', data.estimated_time, 45, 135, y)
      infoRow('Driver', data.driver_name, 330, 420, y)

      y += 30

      const stopNames = Array.isArray(stops)
        ? stops.map(item => item.stop_name).filter(Boolean)
        : []

      doc
        .fillColor('#6B7280')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('Route Stops', 45, y)

      y += 15

      doc
        .fillColor('#111827')
        .font('Helvetica')
        .fontSize(10)
        .text(
          stopNames.length ? stopNames.join('  →  ') : '-',
          45,
          y,
          { width: 505, lineGap: 4 }
        )

      y += 60

      // Fee table
      doc
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .fontSize(15)
        .text('Fee Breakdown', 45, y)

      y += 25

      const tableX = 45
      const tableW = 505
      const rowH = 30

      doc
        .roundedRect(tableX, y, tableW, rowH, 8)
        .fill('#175812')

      doc
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Description', tableX + 15, y + 10)
        .text('Amount', tableX + 390, y + 10)

      y += rowH

      const amountRow = (label, value, isTotal = false) => {
        doc
          .rect(tableX, y, tableW, rowH)
          .fill(isTotal ? '#F4F8F4' : '#FFFFFF')
          .strokeColor('#E5E7EB')
          .rect(tableX, y, tableW, rowH)
          .stroke()

        doc
          .fillColor(isTotal ? '#175812' : '#111827')
          .font(isTotal ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(isTotal ? 12 : 10)
          .text(label, tableX + 15, y + 9)

        doc
          .text(formatMoney(value), tableX + 360, y + 9, {
            width: 120,
            align: 'right',
          })

        y += rowH
      }

      amountRow(
        `Base Fee x ${billingCycleLabels[finalCycle] || 'Monthly'}`,
        subtotal
      )
      amountRow('Tax 16%', tax)
      amountRow('Total Payable Amount', total, true)

      y += 30

      doc
        .fillColor('#6B7280')
        .font('Helvetica')
        .fontSize(10)
        .text(
          'This is a computer-generated fee voucher for UOL Transportation App. Please pay before the due date to avoid service interruption.',
          45,
          y,
          { width: 505, align: 'center' }
        )

      doc
        .fillColor('#175812')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Thank you for using UOL Transportation App', 45, 760, {
          width: 505,
          align: 'center',
        })

      doc.end()
    })
  })
})
// ================= PDF DOWNLOAD =================
app.get('/fee/voucher/:voucherStudentId/pdf', (req, res) => {
  const { voucherStudentId } = req.params
  const requestedCycle = req.query.billing_cycle

  const allowedCycles = ['monthly', 'quarterly', 'six_months', 'yearly']

  const sql = `
    SELECT
      fvs.id AS voucher_student_id,
      fvs.status,
      fvs.paid_at,
      fvs.selected_billing_cycle,
      fvs.subtotal_amount,
      fvs.tax_amount,
      fvs.total_amount,

      fv.id AS voucher_id,
      fv.title,
      fv.amount AS base_amount,
      fv.due_date,
      fv.message,
      fv.created_at,

      s.id AS student_id,
      s.reg_no,
      s.department,

      u.name AS student_name,
      u.email AS student_email,

      tr.id AS transport_request_id,
      tr.approved_at,

      r.id AS route_id,
      r.route_name,
      r.source,
      r.destination,
      r.estimated_time,

      b.bus_number,
      b.driver_name,
      b.capacity

    FROM fee_voucher_students fvs

    JOIN fee_vouchers fv
      ON fv.id = fvs.voucher_id

    JOIN students s
      ON s.id = fvs.student_id

    JOIN users u
      ON u.id = s.user_id

    LEFT JOIN transport_requests tr
      ON tr.student_id = s.id
      AND tr.status = 'approved'

    LEFT JOIN routes r
      ON r.id = tr.route_id

    LEFT JOIN buses b
      ON b.id = tr.assigned_bus_id

    WHERE fvs.id = ?

    ORDER BY tr.id DESC
    LIMIT 1
  `

  db.query(sql, [voucherStudentId], (err, rows) => {
    if (err) {
      console.log('PDF VOUCHER FETCH ERROR:', err)
      return res.status(500).json({
        success: false,
        message: err.message,
      })
    }

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found',
      })
    }

    const data = rows[0]

    let finalCycle =
      data.selected_billing_cycle ||
      requestedCycle ||
      'monthly'

    if (!allowedCycles.includes(finalCycle)) {
      finalCycle = 'monthly'
    }

    const calculated = calculateFeeAmounts(data.base_amount, finalCycle)

    const subtotal =
      Number(data.subtotal_amount) > 0
        ? Number(data.subtotal_amount)
        : calculated.subtotal

    const tax =
      Number(data.tax_amount) > 0
        ? Number(data.tax_amount)
        : calculated.tax

    const total =
      Number(data.total_amount) > 0
        ? Number(data.total_amount)
        : calculated.total

    const stopsSql = `
      SELECT stop_name
      FROM route_stops
      WHERE route_id = ?
      ORDER BY stop_order ASC
    `

    db.query(stopsSql, [data.route_id], (stopsErr, stops) => {
      if (stopsErr) {
        console.log('PDF STOPS ERROR:', stopsErr)
        return res.status(500).json({
          success: false,
          message: stopsErr.message,
        })
      }

      const fileName = `UOL-Fee-Voucher-${data.reg_no || data.student_id}.pdf`

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      )

      const doc = new PDFDocument({
        size: 'A4',
        margin: 45,
      })

      doc.pipe(res)

      // Header background
      doc
        .rect(0, 0, 595, 115)
        .fill('#175812')

      doc
        .fillColor('#FFFFFF')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('UOL Transportation App', 45, 32)

      doc
        .fontSize(13)
        .font('Helvetica')
        .text('Official Fee Voucher', 45, 62)

      doc
        .fontSize(10)
        .text(`Voucher No: UOL-FEE-${data.voucher_student_id}`, 390, 35)
        .text(`Issue Date: ${formatDate(data.created_at)}`, 390, 55)
        .text(`Due Date: ${formatDate(data.due_date)}`, 390, 75)

      // Status badge
      const statusColor = data.status === 'paid' ? '#219653' : '#F2994A'

      doc
        .roundedRect(45, 135, 505, 38, 10)
        .fill('#F4F8F4')

      doc
        .fillColor('#175812')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text(data.title || 'Transport Fee Voucher', 60, 147)

      doc
        .fillColor(statusColor)
        .fontSize(11)
        .text(String(data.status || 'unpaid').toUpperCase(), 470, 148)

      // Student info
      let y = 200

      doc
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .fontSize(15)
        .text('Student Information', 45, y)

      y += 25

      const infoRow = (label, value, x1, x2, yy) => {
        doc
          .fillColor('#6B7280')
          .font('Helvetica-Bold')
          .fontSize(9)
          .text(label, x1, yy)

        doc
          .fillColor('#111827')
          .font('Helvetica')
          .fontSize(11)
          .text(value || '-', x2, yy)
      }

      infoRow('Name', data.student_name, 45, 135, y)
      infoRow('Reg No', data.reg_no, 330, 420, y)

      y += 22
      infoRow('Email', data.student_email, 45, 135, y)
      infoRow('Department', data.department, 330, 420, y)

      // Route info
      y += 45

      doc
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .fontSize(15)
        .text('Selected Route Information', 45, y)

      y += 25

      infoRow('Route Name', data.route_name, 45, 135, y)
      infoRow('Bus Number', data.bus_number, 330, 420, y)

      y += 22
      infoRow('Source', data.source, 45, 135, y)
      infoRow('Destination', data.destination, 330, 420, y)

      y += 22
      infoRow('Estimated Time', data.estimated_time, 45, 135, y)
      infoRow('Driver', data.driver_name, 330, 420, y)

      y += 30

      const stopNames = Array.isArray(stops)
        ? stops.map(item => item.stop_name).filter(Boolean)
        : []

      doc
        .fillColor('#6B7280')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('Route Stops', 45, y)

      y += 15

      doc
        .fillColor('#111827')
        .font('Helvetica')
        .fontSize(10)
        .text(
          stopNames.length ? stopNames.join('  →  ') : '-',
          45,
          y,
          { width: 505, lineGap: 4 }
        )

      y += 60

      // Fee table
      doc
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .fontSize(15)
        .text('Fee Breakdown', 45, y)

      y += 25

      const tableX = 45
      const tableW = 505
      const rowH = 30

      doc
        .roundedRect(tableX, y, tableW, rowH, 8)
        .fill('#175812')

      doc
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Description', tableX + 15, y + 10)
        .text('Amount', tableX + 390, y + 10)

      y += rowH

      const amountRow = (label, value, isTotal = false) => {
        doc
          .rect(tableX, y, tableW, rowH)
          .fill(isTotal ? '#F4F8F4' : '#FFFFFF')
          .strokeColor('#E5E7EB')
          .rect(tableX, y, tableW, rowH)
          .stroke()

        doc
          .fillColor(isTotal ? '#175812' : '#111827')
          .font(isTotal ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(isTotal ? 12 : 10)
          .text(label, tableX + 15, y + 9)

        doc
          .text(formatMoney(value), tableX + 360, y + 9, {
            width: 120,
            align: 'right',
          })

        y += rowH
      }

      amountRow(
        `Base Fee x ${billingCycleLabels[finalCycle] || 'Monthly'}`,
        subtotal
      )
      amountRow('Tax 16%', tax)
      amountRow('Total Payable Amount', total, true)

      y += 30

      doc
        .fillColor('#6B7280')
        .font('Helvetica')
        .fontSize(10)
        .text(
          'This is a computer-generated fee voucher for UOL Transportation App. Please pay before the due date to avoid service interruption.',
          45,
          y,
          { width: 505, align: 'center' }
        )

      doc
        .fillColor('#175812')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Thank you for using UOL Transportation App', 45, 760, {
          width: 505,
          align: 'center',
        })

      doc.end()
    })
  })
})

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
