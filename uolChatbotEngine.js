const normalizeText = text => {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const includesAny = (text, words) => {
  return words.some(word => text.includes(word));
};

const getRole = role => {
  const value = String(role || '').toLowerCase();

  if (value.includes('admin')) return 'admin';
  if (value.includes('driver')) return 'driver';

  return 'student';
};

const isComplaintRequest = text => {
  return includesAny(text, [
    'complaint',
    'complain',
    'shikayat',
    'şikayat',
    'masla',
    'problem',
    'issue',
    'register kro',
    'register karo',
    'bhej do',
    'admin ko bhejo',
    'admin ko send',
    'report kro',
    'report karo',
    'شکایت',
    'مسئلہ',
  ]);
};

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
  ]);
};

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
    };
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
    };
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
    };
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
    };
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
    };
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
    };
  }

  return {
    category: 'General Complaint',
    title: 'Transport related complaint',
  };
};

const cleanComplaintDescription = message => {
  let description = String(message || '').trim();

  description = description
    .replace(/complaint register kro/gi, '')
    .replace(/complaint register karo/gi, '')
    .replace(/register complaint/gi, '')
    .replace(/admin ko bhej do/gi, '')
    .replace(/admin ko send karo/gi, '')
    .replace(/report kro/gi, '')
    .replace(/report karo/gi, '')
    .trim();

  return description || message;
};

const getSuggestions = role => {
  if (role === 'admin') {
    return [
      'Pending complaints',
      'Send notification',
      'Live buses',
      'Add driver',
    ];
  }

  if (role === 'driver') {
    return [
      'Start ride',
      'End ride',
      'My route',
      'Ride status issue',
    ];
  }

  return [
    'Track my bus',
    'Register complaint',
    'Fee voucher',
    'My route',
  ];
};

const getNormalReply = ({ text, role }) => {
  if (
    includesAny(text, [
      'hi',
      'hello',
      'salam',
      'assalam',
      'assalamualaikum',
    ])
  ) {
    return {
      reply:
        'Assalamualaikum! I am your UOL Transportation Assistant. You can ask me about bus tracking, routes, fee vouchers, complaints, notifications, or ride status.',
      action: null,
      intent: 'greeting',
    };
  }

  if (
    includesAny(text, [
      'bus',
      'tracking',
      'track',
      'location',
      'meri bus',
      'kahan',
      'kidhar',
      'eta',
    ])
  ) {
    return {
      reply:
        'You can track your assigned bus from Live Bus Tracking. If the driver has started the ride, you will see bus location, ETA, distance, and route stops.',
      action: role === 'student' ? 'LiveBusTracking' : role === 'driver' ? 'TripControl' : 'AllLiveTracking',
      intent: 'live_tracking',
    };
  }

  if (
    includesAny(text, [
      'fee',
      'voucher',
      'payment',
      'pay',
      'tax',
      'pdf',
    ])
  ) {
    return {
      reply:
        'Fee voucher section shows billing cycle, route fee, 16% tax, total amount, payment status, and PDF download option.',
      action: role === 'student' ? 'StudentVoucher' : 'SendVoucher',
      intent: 'fee_voucher',
    };
  }

  if (
    includesAny(text, [
      'notification',
      'alert',
      'message',
      'badge',
      'unread',
    ])
  ) {
    return {
      reply:
        'Notifications are used for admin announcements, fee updates, bus delay alerts, arrival alerts, and unread badge count.',
      action:
        role === 'student'
          ? 'StudentNotification'
          : role === 'driver'
          ? 'DriverNotification'
          : 'SendNotification',
      intent: 'notifications',
    };
  }

  if (
    includesAny(text, [
      'route',
      'stop',
      'pickup',
      'source',
      'destination',
    ])
  ) {
    return {
      reply:
        'Routes include source, destination, estimated time, and assigned stops. Students and drivers can view route details according to their assigned route.',
      action: role === 'driver' ? 'TripControl' : 'Routes',
      intent: 'routes',
    };
  }

  return {
    reply:
      'I am designed for the UOL Transportation System. You can ask me about live bus tracking, route stops, fee vouchers, complaints, notifications, drivers, or ride status.',
    action: null,
    intent: 'unknown',
  };
};

const buildChatbotResponse = ({ message, role }) => {
  const normalizedRole = getRole(role);
  const text = normalizeText(message);

  if (!text) {
    return {
      type: 'reply',
      reply: 'Please type your question first.',
      action: null,
      intent: 'empty',
      suggestions: getSuggestions(normalizedRole),
    };
  }

  if (isComplaintRequest(text)) {
    const directCommand = isDirectComplaintCommand(text);
    const complaintInfo = detectComplaintCategory(text);
    const description = cleanComplaintDescription(message);

    if (directCommand && description.length >= 8) {
      return {
        type: 'create_complaint',
        intent: 'create_complaint',
        complaint: {
          title: complaintInfo.title,
          category: complaintInfo.category,
          description,
        },
        suggestions: getSuggestions(normalizedRole),
      };
    }

    return {
      type: 'reply',
      reply:
        'Ye complaint issue lag raha hai. Please message mein clearly likhein: “meri bus late ati hai complaint register kro” ya “driver badtameezi kr raha hai complaint bhej do”.',
      action: 'Complaints',
      intent: 'complaint_help',
      suggestions: [
        'meri bus late ati hai complaint register kro',
        'bus location update nahi ho rahi complaint register kro',
        'driver behavior complaint register kro',
      ],
    };
  }

  const normal = getNormalReply({
    text,
    role: normalizedRole,
  });

  return {
    type: 'reply',
    ...normal,
    suggestions: getSuggestions(normalizedRole),
  };
};

module.exports = {
  buildChatbotResponse,
};