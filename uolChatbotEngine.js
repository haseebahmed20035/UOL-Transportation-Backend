const ACTION_KEYS = {
  LIVE_TRACKING: 'OPEN_LIVE_TRACKING',

  STUDENT_ROUTE: 'OPEN_STUDENT_ROUTE',
  ALL_ROUTES: 'OPEN_ALL_ROUTES',
  MANAGE_ROUTES: 'OPEN_MANAGE_ROUTES',
  ADD_ROUTE: 'OPEN_ADD_ROUTE',
  VIEW_ROUTES: 'OPEN_VIEW_ROUTES',

  TRIP_CONTROL: 'OPEN_TRIP_CONTROL',
  DRIVER_ROUTE: 'OPEN_DRIVER_ROUTE',

  FEE_VOUCHER: 'OPEN_FEE_VOUCHER',
  SEND_VOUCHER: 'OPEN_SEND_VOUCHER',

  STUDENT_COMPLAINT: 'OPEN_STUDENT_COMPLAINT',
  ADMIN_COMPLAINTS: 'OPEN_ADMIN_COMPLAINTS',

  STUDENT_NOTIFICATIONS: 'OPEN_STUDENT_NOTIFICATIONS',
  DRIVER_NOTIFICATIONS: 'OPEN_DRIVER_NOTIFICATIONS',
  SEND_NOTIFICATION: 'OPEN_SEND_NOTIFICATION',

  ALL_LIVE_TRACKING: 'OPEN_ALL_LIVE_TRACKING',

  STUDENTS: 'OPEN_STUDENTS',
  ADD_STUDENT: 'OPEN_ADD_STUDENT',
  STUDENT_REQUESTS: 'OPEN_STUDENT_REQUESTS',

  DRIVERS: 'OPEN_DRIVERS',
  ADD_DRIVER: 'OPEN_ADD_DRIVER',
  DRIVER_PROFILE: 'OPEN_DRIVER_PROFILE',

  BUSES: 'OPEN_BUSES',
  ADD_BUS: 'OPEN_ADD_BUS',
  VIEW_BUS: 'OPEN_VIEW_BUS',

  REQUEST_TRANSPORT: 'OPEN_REQUEST_TRANSPORT',
  SETTINGS: 'OPEN_SETTINGS',
  HELP: 'OPEN_HELP',
}

const normalizeText = text => {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const includesAny = (text, words) => {
  return words.some(word => text.includes(word))
}

const getRole = role => {
  const value = String(role || '').toLowerCase()

  if (value.includes('admin')) return 'admin'
  if (value.includes('driver')) return 'driver'

  return 'student'
}

const getActionLabel = actionKey => {
  const labels = {
    [ACTION_KEYS.LIVE_TRACKING]: 'Open Live Tracking',

    [ACTION_KEYS.STUDENT_ROUTE]: 'Open My Route',
    [ACTION_KEYS.ALL_ROUTES]: 'Open All Routes',
    [ACTION_KEYS.MANAGE_ROUTES]: 'Open Manage Routes',
    [ACTION_KEYS.ADD_ROUTE]: 'Open Add Route',
    [ACTION_KEYS.VIEW_ROUTES]: 'Open View Routes',

    [ACTION_KEYS.TRIP_CONTROL]: 'Open Trip Control',
    [ACTION_KEYS.DRIVER_ROUTE]: 'Open My Route',

    [ACTION_KEYS.FEE_VOUCHER]: 'Open Fee Voucher',
    [ACTION_KEYS.SEND_VOUCHER]: 'Open Send Voucher',

    [ACTION_KEYS.STUDENT_COMPLAINT]: 'Open Complaint Screen',
    [ACTION_KEYS.ADMIN_COMPLAINTS]: 'Open Complaints',

    [ACTION_KEYS.STUDENT_NOTIFICATIONS]: 'Open Notifications',
    [ACTION_KEYS.DRIVER_NOTIFICATIONS]: 'Open Notifications',
    [ACTION_KEYS.SEND_NOTIFICATION]: 'Open Send Notification',

    [ACTION_KEYS.ALL_LIVE_TRACKING]: 'Open Live Buses',

    [ACTION_KEYS.STUDENTS]: 'Open Students',
    [ACTION_KEYS.ADD_STUDENT]: 'Open Add Student',
    [ACTION_KEYS.STUDENT_REQUESTS]: 'Open Student Requests',

    [ACTION_KEYS.DRIVERS]: 'Open Drivers',
    [ACTION_KEYS.ADD_DRIVER]: 'Open Add Driver',
    [ACTION_KEYS.DRIVER_PROFILE]: 'Open Driver Profile',

    [ACTION_KEYS.BUSES]: 'Open Buses',
    [ACTION_KEYS.ADD_BUS]: 'Open Add Bus',
    [ACTION_KEYS.VIEW_BUS]: 'Open View Bus',

    [ACTION_KEYS.REQUEST_TRANSPORT]: 'Open Transport Request',
    [ACTION_KEYS.SETTINGS]: 'Open Settings',
    [ACTION_KEYS.HELP]: 'Open Help',
  }

  return labels[actionKey] || 'Open Related Screen'
}

const isGreeting = text => {
  return includesAny(text, [
    'hi',
    'hello',
    'salam',
    'assalam',
    'assalamualaikum',
    'hey',
  ])
}

const isOffTopic = text => {
  return includesAny(text, [
    'cricket',
    'movie',
    'song',
    'game',
    'recipe',
    'politics',
    'shopping',
    'instagram',
    'facebook',
  ])
}

const isHelpRequest = text => {
  return includesAny(text, [
    'help',
    'madad',
    'guide',
    'samjhao',
    'samjha do',
    'kaise',
    'kese',
    'how',
    'how to',
    'kya karun',
    'kya karna',
    'use kaise',
    'open kaise',
    'where',
    'kahan',
    'not working',
    'nahi ho raha',
    'nahi chal raha',
    'problem',
    'issue',
    'masla',
    'مسئلہ',
    'مدد',
  ])
}

const isComplaintRequest = text => {
  return includesAny(text, [
    'complaint',
    'complain',
    'shikayat',
    'masla',
    'problem',
    'issue',
    'شکایت',
    'مسئلہ',
  ])
}

const isDirectComplaintCommand = text => {
  return includesAny(text, [
    'complaint register',
    'complain register',
    'register complaint',
    'register kro',
    'register karo',
    'complaint bhej',
    'admin ko bhej',
    'admin ko send',
    'report kro',
    'report karo',
    'shikayat register',
    'شکایت درج',
  ])
}

const detectComplaintCategory = text => {
  if (
    includesAny(text, [
      'late',
      'delay',
      'der',
      'dair',
      'late ati',
      'late aati',
      'time par nahi',
      'wait',
      'intezar',
      'انتظار',
      'دیر',
    ])
  ) {
    return {
      category: 'Bus Delay',
      title: 'Bus is arriving late',
    }
  }

  if (
    includesAny(text, [
      'location',
      'tracking',
      'track',
      'map',
      'gps',
      'update nahi',
      'not updating',
      'live',
    ])
  ) {
    return {
      category: 'Live Tracking Issue',
      title: 'Bus live location is not updating',
    }
  }

  if (
    includesAny(text, [
      'driver',
      'badtameezi',
      'bad behavior',
      'rude',
      'misbehave',
      'misbehavior',
      'behaviour',
      'behavior',
      'بدتمیزی',
    ])
  ) {
    return {
      category: 'Driver Behavior',
      title: 'Driver behavior complaint',
    }
  }

  if (
    includesAny(text, [
      'bus nahi ayi',
      'bus nahi aayi',
      'bus not came',
      'bus not arrived',
      'absent',
      'miss',
      'missing',
    ])
  ) {
    return {
      category: 'Bus Not Arrived',
      title: 'Bus did not arrive',
    }
  }

  if (
    includesAny(text, [
      'fee',
      'voucher',
      'payment',
      'paid',
      'amount',
      'tax',
    ])
  ) {
    return {
      category: 'Fee Voucher Issue',
      title: 'Fee voucher or payment issue',
    }
  }

  if (
    includesAny(text, [
      'route',
      'stop',
      'pickup',
      'wrong stop',
      'stop change',
      'route change',
    ])
  ) {
    return {
      category: 'Route or Stop Issue',
      title: 'Route or stop related issue',
    }
  }

  return {
    category: 'General Complaint',
    title: 'Transport related complaint',
  }
}

const cleanComplaintDescription = message => {
  let description = String(message || '').trim()

  description = description
    .replace(/complaint register kro/gi, '')
    .replace(/complaint register karo/gi, '')
    .replace(/register complaint/gi, '')
    .replace(/admin ko bhej do/gi, '')
    .replace(/admin ko send karo/gi, '')
    .replace(/report kro/gi, '')
    .replace(/report karo/gi, '')
    .replace(/shikayat register kro/gi, '')
    .replace(/shikayat register karo/gi, '')
    .trim()

  return description || message
}

const modules = [
  {
    id: 'student_live_tracking',
    roles: ['student'],
    title: 'Live Bus Tracking',
    actionKey: ACTION_KEYS.LIVE_TRACKING,
    keywords: [
      'bus',
      'track',
      'tracking',
      'live',
      'location',
      'meri bus',
      'kahan',
      'kidhar',
      'eta',
      'distance',
      'map',
      'bus location',
      'bus track',
      'current location',
      'bus nahi dikh rahi',
      'location update',
    ],
    shortReply:
      'You can track your assigned bus from Live Bus Tracking. It shows bus location, route stops, ETA, distance, and last update time when the driver has started the ride.',
    guide:
      `Live Bus Tracking use karne ke liye:\n\n` +
      `1. Student Dashboard open karein.\n` +
      `2. Live Bus Tracking option par tap karein.\n` +
      `3. Agar driver ne ride start ki hai to bus marker map par show hoga.\n` +
      `4. Aap route stops, ETA, distance aur last updated time check kar sakte hain.\n\n` +
      `Agar bus show nahi ho rahi, iska matlab driver ne ride start nahi ki, internet issue hai, ya backend par running bus available nahi hai.`,
  },

  {
    id: 'student_fee_voucher',
    roles: ['student'],
    title: 'Fee Voucher',
    actionKey: ACTION_KEYS.FEE_VOUCHER,
    keywords: [
      'fee',
      'fees',
      'voucher',
      'payment',
      'pay',
      'paid',
      'unpaid',
      'tax',
      'pdf',
      'download',
      'billing',
      'monthly',
      'quarterly',
      'yearly',
      'amount',
    ],
    shortReply:
      'Fee Voucher section mein aap billing cycle, subtotal, 16% tax, total amount, due date, payment status aur PDF voucher check kar sakte hain.',
    guide:
      `Fee Voucher check karne ke liye:\n\n` +
      `1. Student Dashboard open karein.\n` +
      `2. Fee Voucher section par tap karein.\n` +
      `3. Apna voucher select karein.\n` +
      `4. Amount, tax, total fee aur due date check karein.\n` +
      `5. Agar PDF option available hai to voucher download bhi kar sakte hain.\n\n` +
      `Agar amount galat show ho raha hai to aap chatbot se complaint register karwa sakte hain.`,
  },

  {
    id: 'student_complaint',
    roles: ['student'],
    title: 'Complaint Registration',
    actionKey: ACTION_KEYS.STUDENT_COMPLAINT,
    keywords: [
      'complaint',
      'complain',
      'shikayat',
      'masla',
      'problem',
      'issue',
      'register',
      'admin ko bhej',
      'report',
      'driver badtameezi',
      'bus late',
      'bus nahi ayi',
      'location nahi',
    ],
    shortReply:
      'Aap complaint screen se complaint register kar sakte hain. Agar aap message mein clearly likhein “complaint register kro”, to main complaint admin ko khud bhej sakta hoon.',
    guide:
      `Complaint register karne ke 2 tareeqe hain:\n\n` +
      `Method 1: Complaint screen se\n` +
      `1. Dashboard se Complaints screen open karein.\n` +
      `2. Title, category aur description likhein.\n` +
      `3. Submit par tap karein.\n\n` +
      `Method 2: Chatbot se directly\n` +
      `Aap likh sakte hain:\n` +
      `“meri bus late ati hai complaint register kro”\n` +
      `“driver badtameezi kr raha hai complaint bhej do”\n` +
      `“bus location update nahi ho rahi complaint register kro”\n\n` +
      `Main issue samajh kar complaint admin ko send kar dunga.`,
  },

  {
    id: 'student_notifications',
    roles: ['student'],
    title: 'Student Notifications',
    actionKey: ACTION_KEYS.STUDENT_NOTIFICATIONS,
    keywords: [
      'notification',
      'notifications',
      'alert',
      'message',
      'badge',
      'unread',
      'bus alert',
      'arrival',
      'delay alert',
      'fee alert',
    ],
    shortReply:
      'Student notifications mein admin announcements, fee updates, bus delay alerts aur bus arrival alerts show hotay hain.',
    guide:
      `Notifications check karne ke liye:\n\n` +
      `1. Student Dashboard par notification icon dekhein.\n` +
      `2. Badge count unread notifications batata hai.\n` +
      `3. Icon ya notification card par tap karein.\n` +
      `4. Notification detail read karein.\n` +
      `5. Clear button se old notifications remove kar sakte hain.`,
  },

  {
    id: 'student_route',
    roles: ['student'],
    title: 'Assigned Route',
    actionKey: ACTION_KEYS.STUDENT_ROUTE,
    keywords: [
      'route',
      'routes',
      'my route',
      'assigned route',
      'stop',
      'stops',
      'pickup',
      'pickup point',
      'source',
      'destination',
      'route details',
    ],
    shortReply:
      'Aapki assigned route mein source, destination, stops, bus aur driver details hoti hain.',
    guide:
      `Assigned route check karne ke liye:\n\n` +
      `1. Student Dashboard open karein.\n` +
      `2. My Route ya Live Tracking section open karein.\n` +
      `3. Source, destination, stops aur assigned bus details check karein.\n` +
      `4. Agar route approved nahi hai to admin approval ka wait karein.\n\n` +
      `Agar stop wrong show ho raha hai, complaint register kar sakte hain.`,
  },

  {
    id: 'student_request_transport',
    roles: ['student'],
    title: 'Transport Request',
    actionKey: ACTION_KEYS.REQUEST_TRANSPORT,
    keywords: [
      'request transport',
      'transport request',
      'apply transport',
      'route request',
      'bus request',
      'request for transport',
      'transport ke liye apply',
    ],
    shortReply:
      'Student transport request submit kar sakta hai. Admin approval ke baad assigned route aur bus show hoti hai.',
    guide:
      `Transport request submit karne ke liye:\n\n` +
      `1. Student Dashboard open karein.\n` +
      `2. Request For Transport screen open karein.\n` +
      `3. Route select karein.\n` +
      `4. Apna stop select karein.\n` +
      `5. Request submit karein.\n\n` +
      `Admin approval ke baad route aur bus details show hongi.`,
  },

  {
    id: 'driver_trip_control',
    roles: ['driver'],
    title: 'Trip Control',
    actionKey: ACTION_KEYS.TRIP_CONTROL,
    keywords: [
      'start ride',
      'start trip',
      'end ride',
      'end trip',
      'stop ride',
      'ride',
      'trip',
      'timer',
      'start bus',
      'driver ride',
      'trip control',
      'ride active',
    ],
    shortReply:
      'Driver Trip Control screen se ride start/end karta hai. Ride live tab hoti hai jab status running ya live ho.',
    guide:
      `Driver ride start karne ke liye:\n\n` +
      `1. Driver Dashboard open karein.\n` +
      `2. Trip Control screen par jayen.\n` +
      `3. App current GPS location check karegi.\n` +
      `4. Agar aap first stop ke near hain to Start Ride allow hoga.\n` +
      `5. Start ke baad live GPS backend ko send hoti rahegi.\n\n` +
      `Ride end karne ke liye End Ride par tap karein. Is se tracking stop hogi aur dashboard par Ride Active remove ho jana chahiye.`,
  },

  {
    id: 'driver_route',
    roles: ['driver'],
    title: 'Driver Assigned Route',
    actionKey: ACTION_KEYS.DRIVER_ROUTE,
    keywords: [
      'my route',
      'assigned route',
      'driver route',
      'route',
      'stops',
      'first stop',
      'source',
      'destination',
    ],
    shortReply:
      'Driver apni assigned route Driver My Route ya Trip Control screen par dekh sakta hai.',
    guide:
      `Driver route check karne ke liye:\n\n` +
      `1. Driver Dashboard open karein.\n` +
      `2. Driver My Route ya Trip Control par tap karein.\n` +
      `3. Assigned bus, route name, source, destination aur stops check karein.\n` +
      `4. Start ride sirf first stop ke near allow honi chahiye.`,
  },

  {
    id: 'driver_notifications',
    roles: ['driver'],
    title: 'Driver Notifications',
    actionKey: ACTION_KEYS.DRIVER_NOTIFICATIONS,
    keywords: [
      'notification',
      'notifications',
      'alert',
      'admin message',
      'driver alert',
      'badge',
      'unread',
    ],
    shortReply:
      'Driver notifications mein admin alerts aur transport updates show hotay hain.',
    guide:
      `Driver notifications check karne ke liye:\n\n` +
      `1. Driver Dashboard par notification icon check karein.\n` +
      `2. Badge unread notifications show karta hai.\n` +
      `3. Notification screen open karein.\n` +
      `4. Read ya clear notifications manage karein.`,
  },

  {
    id: 'admin_students',
    roles: ['admin'],
    title: 'Student Management',
    actionKey: ACTION_KEYS.STUDENTS,
    keywords: [
      'student',
      'students',
      'student list',
      'all students',
      'manage student',
      'student manage',
    ],
    shortReply:
      'Admin students view aur manage kar sakta hai. Student account create hone par credentials email send hoti hain.',
    guide:
      `Students manage karne ke liye:\n\n` +
      `1. Admin Dashboard open karein.\n` +
      `2. Students section open karein.\n` +
      `3. All students list check karein.\n` +
      `4. Student details view/manage karein.\n\n` +
      `New student add karne ke liye “add student” pooch sakte hain.`,
  },

  {
    id: 'admin_add_student',
    roles: ['admin'],
    title: 'Add Student',
    actionKey: ACTION_KEYS.ADD_STUDENT,
    keywords: [
      'add student',
      'new student',
      'student add',
      'student email',
      'uol email',
      'registration',
      'reg no',
    ],
    shortReply:
      'Admin Add Student screen se student account create kar sakta hai.',
    guide:
      `Student add karne ke liye:\n\n` +
      `1. Admin Dashboard open karein.\n` +
      `2. Add Student screen open karein.\n` +
      `3. Name, UOL email, registration number aur department enter karein.\n` +
      `4. Submit karein.\n\n` +
      `System student account create karega aur email credentials send karega.`,
  },

  {
    id: 'admin_student_requests',
    roles: ['admin'],
    title: 'Student Requests',
    actionKey: ACTION_KEYS.STUDENT_REQUESTS,
    keywords: [
      'student request',
      'student requests',
      'transport request',
      'pending request',
      'approve request',
      'reject request',
    ],
    shortReply:
      'Admin student transport requests approve ya reject kar sakta hai.',
    guide:
      `Student transport requests handle karne ke liye:\n\n` +
      `1. Admin Dashboard open karein.\n` +
      `2. Student Requests screen open karein.\n` +
      `3. Pending requests check karein.\n` +
      `4. Route aur student stop verify karein.\n` +
      `5. Request approve ya reject karein.`,
  },

  {
    id: 'admin_drivers',
    roles: ['admin'],
    title: 'Driver Management',
    actionKey: ACTION_KEYS.DRIVERS,
    keywords: [
      'driver',
      'drivers',
      'driver list',
      'all drivers',
      'manage driver',
      'driver manage',
    ],
    shortReply:
      'Admin drivers view, delete aur manage kar sakta hai.',
    guide:
      `Drivers manage karne ke liye:\n\n` +
      `1. Admin Dashboard open karein.\n` +
      `2. Drivers section open karein.\n` +
      `3. Driver list check karein.\n` +
      `4. Driver details, availability aur assigned bus/route check karein.\n\n` +
      `New driver add karne ke liye “add driver” pooch sakte hain.`,
  },

  {
    id: 'admin_add_driver',
    roles: ['admin'],
    title: 'Add Driver',
    actionKey: ACTION_KEYS.ADD_DRIVER,
    keywords: [
      'add driver',
      'new driver',
      'driver add',
      'cnic',
      'joining date',
      'driver account',
    ],
    shortReply:
      'Admin Add Driver screen se driver account create kar sakta hai.',
    guide:
      `Driver add karne ke liye:\n\n` +
      `1. Admin Dashboard open karein.\n` +
      `2. Add Driver screen open karein.\n` +
      `3. Name, email, father name, phone, CNIC aur joining date enter karein.\n` +
      `4. Submit karein.\n\n` +
      `System driver account create karega aur email credentials send karega.`,
  },

  {
    id: 'admin_routes',
    roles: ['admin'],
    title: 'Manage Routes',
    actionKey: ACTION_KEYS.MANAGE_ROUTES,
    keywords: [
      'route',
      'routes',
      'add route',
      'manage route',
      'stops',
      'departure',
      'source',
      'destination',
    ],
    shortReply:
      'Admin routes, source, destination, estimated time aur stops manage kar sakta hai.',
    guide:
      `Routes manage karne ke liye:\n\n` +
      `1. Admin Dashboard se Manage Routes screen open karein.\n` +
      `2. Source, destination aur estimated time add karein.\n` +
      `3. Route stops latitude/longitude ke sath add karein.\n` +
      `4. Route save karein.\n\n` +
      `Routes students aur buses assignment ke liye use hoti hain.`,
  },

  {
    id: 'admin_buses',
    roles: ['admin'],
    title: 'Manage Buses',
    actionKey: ACTION_KEYS.BUSES,
    keywords: [
      'bus',
      'buses',
      'add bus',
      'manage bus',
      'bus list',
      'assign driver',
      'assign route',
      'capacity',
    ],
    shortReply:
      'Admin buses add, view, update aur delete kar sakta hai.',
    guide:
      `Buses manage karne ke liye:\n\n` +
      `1. Admin Dashboard se Manage Buses screen open karein.\n` +
      `2. Bus add karein.\n` +
      `3. Available driver select karein.\n` +
      `4. Route assign karein.\n` +
      `5. Capacity aur departure timings set karein.\n\n` +
      `Bus add hone ke baad selected driver unavailable ho jata hai.`,
  },

  {
    id: 'admin_complaints',
    roles: ['admin'],
    title: 'Complaint Management',
    actionKey: ACTION_KEYS.ADMIN_COMPLAINTS,
    keywords: [
      'complaint',
      'complaints',
      'pending complaint',
      'resolve',
      'admin response',
      'student issue',
      'shikayat',
      'masla',
    ],
    shortReply:
      'Admin complaints screen se student complaints view, respond aur resolve kar sakta hai.',
    guide:
      `Complaint handle karne ke liye:\n\n` +
      `1. Admin Dashboard se Complaints screen open karein.\n` +
      `2. Pending complaints check karein.\n` +
      `3. Complaint detail read karein.\n` +
      `4. Admin response likhein.\n` +
      `5. Status update karein: pending, in progress, resolved.\n\n` +
      `Student ko complaint response notification bhi mil sakti hai.`,
  },

  {
    id: 'admin_notifications',
    roles: ['admin'],
    title: 'Send Notifications',
    actionKey: ACTION_KEYS.SEND_NOTIFICATION,
    keywords: [
      'send notification',
      'notification',
      'notifications',
      'announcement',
      'alert',
      'students only',
      'drivers only',
      'all users',
      'fcm',
      'push',
    ],
    shortReply:
      'Admin all users, students only, ya drivers only ko notifications send kar sakta hai.',
    guide:
      `Notification send karne ke liye:\n\n` +
      `1. Admin Dashboard se Send Notification screen open karein.\n` +
      `2. Title aur message write karein.\n` +
      `3. Target select karein: All, Students, ya Drivers.\n` +
      `4. Send par tap karein.\n\n` +
      `Notification database mein save hogi aur push notification bhi send hogi agar FCM token available hai.`,
  },

  {
    id: 'admin_live_buses',
    roles: ['admin'],
    title: 'All Live Buses',
    actionKey: ACTION_KEYS.ALL_LIVE_TRACKING,
    keywords: [
      'live buses',
      'running buses',
      'all buses',
      'track buses',
      'admin tracking',
      'bus location',
      'running bus',
    ],
    shortReply:
      'Admin running buses ko All Live Tracking screen par dekh sakta hai.',
    guide:
      `All live buses check karne ke liye:\n\n` +
      `1. Admin Dashboard open karein.\n` +
      `2. All Live Tracking screen open karein.\n` +
      `3. Sirf running rides wali buses show honi chahiye.\n` +
      `4. Bus number, driver, route aur last location check karein.\n\n` +
      `Agar bus active hai but running nahi hai, to usay live ride treat nahi karna chahiye.`,
  },

  {
    id: 'admin_fee',
    roles: ['admin'],
    title: 'Fee Voucher Management',
    actionKey: ACTION_KEYS.SEND_VOUCHER,
    keywords: [
      'fee',
      'voucher',
      'send voucher',
      'fee voucher',
      'payment',
      'tax',
      'due date',
      'reminder',
    ],
    shortReply:
      'Admin students ko fee vouchers issue kar sakta hai, due date set kar sakta hai, aur reminder send kar sakta hai.',
    guide:
      `Fee voucher send karne ke liye:\n\n` +
      `1. Admin Dashboard se Send Voucher screen open karein.\n` +
      `2. Voucher title, amount aur due date enter karein.\n` +
      `3. Students select karein ya all students choose karein.\n` +
      `4. Send karein.\n\n` +
      `System voucher assign karega aur email/notification send kar sakta hai.`,
  },
]

const getSuggestions = role => {
  if (role === 'admin') {
    return [
      'How to add student?',
      'How to send notification?',
      'How to handle complaints?',
      'How to track live buses?',
    ]
  }

  if (role === 'driver') {
    return [
      'How to start ride?',
      'How to end ride?',
      'My route',
      'Location not updating',
    ]
  }

  return [
    'How to track my bus?',
    'How to check fee voucher?',
    'How to register complaint?',
    'My route help',
  ]
}

const getGeneralHelp = role => {
  if (role === 'admin') {
    return {
      reply:
        `Main aapko Admin panel use karne mein guide kar sakta hoon.\n\n` +
        `Aap mujhse pooch sakte hain:\n` +
        `• How to add student?\n` +
        `• How to add driver?\n` +
        `• How to send notification?\n` +
        `• How to handle complaints?\n` +
        `• How to track live buses?\n` +
        `• How to send fee voucher?`,
      actionKey: null,
      actionLabel: null,
      intent: 'admin_help',
    }
  }

  if (role === 'driver') {
    return {
      reply:
        `Main aapko Driver module use karne mein guide kar sakta hoon.\n\n` +
        `Aap mujhse pooch sakte hain:\n` +
        `• Ride kaise start karun?\n` +
        `• Ride kaise end karun?\n` +
        `• Assigned route kahan milega?\n` +
        `• Location update nahi ho rahi kya karun?\n` +
        `• Notifications kaise check karun?`,
      actionKey: null,
      actionLabel: null,
      intent: 'driver_help',
    }
  }

  return {
    reply:
      `Main aapko Student transport app use karne mein guide kar sakta hoon.\n\n` +
      `Aap mujhse pooch sakte hain:\n` +
      `• Meri bus kaise track karun?\n` +
      `• Fee voucher kaise check karun?\n` +
      `• Complaint kaise register karun?\n` +
      `• Notifications kahan milengi?\n` +
      `• Assigned route kaise check karun?`,
    actionKey: null,
    actionLabel: null,
    intent: 'student_help',
  }
}

const detectBestModule = ({ text, role }) => {
  let bestModule = null
  let bestScore = 0

  const roleModules = modules.filter(module => module.roles.includes(role))

  for (const module of roleModules) {
    let score = 0

    for (const keyword of module.keywords) {
      const cleanKeyword = normalizeText(keyword)

      if (text === cleanKeyword) {
        score += 10
      } else if (text.includes(cleanKeyword)) {
        score += cleanKeyword.split(' ').length > 1 ? 6 : 3
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestModule = module
    }
  }

  return {
    module: bestModule,
    confidence: Math.min(bestScore / 10, 1),
  }
}

const buildModuleReply = ({ module, helpMode }) => {
  if (!module) return null

  return {
    reply: helpMode
      ? module.guide
      : `${module.shortReply}\n\nAgar aap step-by-step guide chahte hain to likhein: “${module.title} kaise use karun?”`,
    actionKey: module.actionKey || null,
    actionLabel: module.actionKey ? getActionLabel(module.actionKey) : null,
    intent: helpMode ? `${module.id}_guide` : module.id,
  }
}

const buildChatbotResponse = ({ message, role }) => {
  const normalizedRole = getRole(role)
  const text = normalizeText(message)

  if (!text) {
    return {
      type: 'reply',
      reply: 'Please type your question first.',
      actionKey: null,
      actionLabel: null,
      intent: 'empty',
      suggestions: getSuggestions(normalizedRole),
    }
  }

  if (isOffTopic(text)) {
    return {
      type: 'reply',
      reply:
        'I am designed specifically for the UOL Transportation System. Please ask about buses, routes, fee vouchers, complaints, notifications, drivers, students, or live tracking.',
      actionKey: null,
      actionLabel: null,
      intent: 'off_topic',
      suggestions: getSuggestions(normalizedRole),
    }
  }

  if (isGreeting(text)) {
    const help = getGeneralHelp(normalizedRole)

    return {
      type: 'reply',
      reply:
        `Assalamualaikum! I am your UOL Transportation Assistant.\n\n` +
        help.reply,
      actionKey: null,
      actionLabel: null,
      intent: 'greeting',
      suggestions: getSuggestions(normalizedRole),
    }
  }

  const helpMode = isHelpRequest(text)

  const { module, confidence } = detectBestModule({
    text,
    role: normalizedRole,
  })

  if (isComplaintRequest(text) && isDirectComplaintCommand(text)) {
    if (normalizedRole !== 'student') {
      return {
        type: 'reply',
        reply:
          'Complaint registration through chatbot is currently available for students only. Admin can handle complaints from the complaint management screen.',
        actionKey:
          normalizedRole === 'admin' ? ACTION_KEYS.ADMIN_COMPLAINTS : null,
        actionLabel:
          normalizedRole === 'admin'
            ? getActionLabel(ACTION_KEYS.ADMIN_COMPLAINTS)
            : null,
        intent: 'complaint_not_allowed',
        suggestions: getSuggestions(normalizedRole),
      }
    }

    const complaintInfo = detectComplaintCategory(text)
    const description = cleanComplaintDescription(message)

    if (description.length >= 8) {
      return {
        type: 'create_complaint',
        intent: 'create_complaint',
        complaint: {
          title: complaintInfo.title,
          category: complaintInfo.category,
          description,
        },
        actionKey: ACTION_KEYS.STUDENT_COMPLAINT,
        actionLabel: getActionLabel(ACTION_KEYS.STUDENT_COMPLAINT),
        suggestions: getSuggestions(normalizedRole),
      }
    }
  }

  if (isComplaintRequest(text) && !isDirectComplaintCommand(text)) {
    const complaintModule = modules.find(
      item => item.id === 'student_complaint',
    )

    if (normalizedRole === 'student') {
      return {
        type: 'reply',
        ...buildModuleReply({
          module: complaintModule,
          helpMode: true,
        }),
        suggestions: [
          'meri bus late ati hai complaint register kro',
          'driver badtameezi kr raha hai complaint bhej do',
          'bus location update nahi ho rahi complaint register kro',
        ],
      }
    }

    if (normalizedRole === 'admin') {
      const adminComplaintModule = modules.find(
        item => item.id === 'admin_complaints',
      )

      return {
        type: 'reply',
        ...buildModuleReply({
          module: adminComplaintModule,
          helpMode: true,
        }),
        suggestions: getSuggestions(normalizedRole),
      }
    }
  }

  if (helpMode && module && confidence >= 0.2) {
    return {
      type: 'reply',
      ...buildModuleReply({
        module,
        helpMode: true,
      }),
      suggestions: getSuggestions(normalizedRole),
    }
  }

  if (helpMode && (!module || confidence < 0.2)) {
    const help = getGeneralHelp(normalizedRole)

    return {
      type: 'reply',
      ...help,
      suggestions: getSuggestions(normalizedRole),
    }
  }

  if (module && confidence >= 0.2) {
    return {
      type: 'reply',
      ...buildModuleReply({
        module,
        helpMode: false,
      }),
      suggestions: getSuggestions(normalizedRole),
    }
  }

  return {
    type: 'reply',
    reply:
      `Mujhe aapka question fully samajh nahi aya, lekin main UOL Transportation System mein help kar sakta hoon.\n\n` +
      `Aap is tarah pooch sakte hain:\n` +
      `• bus kaise track karun?\n` +
      `• fee voucher kaise check karun?\n` +
      `• complaint kaise register karun?\n` +
      `• notifications kahan milengi?\n` +
      `• ride kaise start karun?`,
    actionKey: null,
    actionLabel: null,
    intent: 'unknown',
    suggestions: getSuggestions(normalizedRole),
  }
}

module.exports = {
  buildChatbotResponse,
  ACTION_KEYS,
}