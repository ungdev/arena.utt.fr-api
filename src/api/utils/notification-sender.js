const axios = require('axios');
const SendNotification = async (title, content, params) => {
  await axios.post(
    'https://onesignal.com/api/v1/notifications',
    {
      contents: {
        fr: content,
        en: content,
      },
      headings: {
        fr: title,
        en: title,
      },
    },
    {
      params: {
        app_id: process.env.ONESIGNAL_ID,
        ...params,
      },
    }
  );
};

/**
 * Send a notification to all tournaments. if tournamentId is null, broadcast to all tournaments
 * @param {string} title
 * @param {string} content
 * @param {string} tournamentId if null, broadcast to all tournaments
 */
const SendNotificationToTournament = (title, content, tournamentId) => {
  SendNotification(title, content, {
    included_segments: ['Active Users'],
    ...(tournamentId && {
      //if tournamentId is null, don't put filter
      filters: [
        {
          field: 'tag',
          key: 'tournamentId',
          relation: '=',
          value: tournamentId,
        },
      ],
    }),
  });
};

module.exports = { SendNotification, SendNotificationToTournament };
