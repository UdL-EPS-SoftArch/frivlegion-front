(function (global) {
  'use strict';

  function getTargetOrigin() {
    if (
      global.location &&
      typeof global.location.origin === 'string' &&
      global.location.origin &&
      global.location.origin !== 'null'
    ) {
      return global.location.origin;
    }
    return '*';
  }

  function postToParent(type, data) {
    if (global.parent && typeof global.parent.postMessage === 'function') {
      global.parent.postMessage(
        {
          type: type,
          data: data
        },
        getTargetOrigin()
      );
    }
  }

  const FrivLegionSDK = {
    submitScore: function (gameId, score) {
      postToParent('FRIVLEGION_SCORE', {
        gameId: gameId,
        score: score
      });
    },

    saveState: function (gameId, state) {
      postToParent('FRIVLEGION_SAVE_STATE', {
        gameId: gameId,
        state: state
      });
    },

    onLoadState: function (callback) {
      if (typeof callback !== 'function') {
        return function () {};
      }

      function handleMessage(event) {
        if (event.origin !== global.location.origin) {
          return;
        }
        const payload = event.data;
        if (!payload || typeof payload !== 'object') {
          return;
        }
        if (payload.type === 'FRIVLEGION_LOAD_STATE') {
          const state =
            payload.data &&
            typeof payload.data === 'object' &&
            'state' in payload.data
              ? payload.data.state
              : payload.state;
          if (state !== undefined) {
            callback(state);
          }
        }
      }

      global.addEventListener('message', handleMessage);
      return function unsubscribe() {
        global.removeEventListener('message', handleMessage);
      };
    }
  };

  global.FrivLegionSDK = FrivLegionSDK;
})(window);
