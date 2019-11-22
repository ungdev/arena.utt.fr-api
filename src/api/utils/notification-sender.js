const axios = require('axios');
const SendNotification = (title, content, params) => {
  axios.post(
    'https://onesignal.com/api/v1/notifications',
    {
      contents: {
        fr: content,
      },
      headings: {
        fr: title,
      },
    },
    {
      params: {
        app_id: '4483353a-c200-40a6-9a59-1db5fd155363',
        ...params,
      },
    }
  );
};

const SendNotificationToTournament = (title, content, tournamentId) => {
  SendNotification(title, content, {
    included_segments: ['Active Users'],
    filters: [
      {
        field: 'tag',
        key: 'tournamentId',
        relation: '=',
        value: tournamentId,
      },
    ],
  });
};

module.exports = { SendNotification, SendNotificationToTournament };
