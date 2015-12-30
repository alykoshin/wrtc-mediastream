'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug = require('mini-debug');
  var Attachable = require('attachable');
  var WebapiMediaStream = require('webapi-mediastream');
}

/**
 *
 * @constructor
 * @extends WebapiMediaStream
 * @param {MediaStream} stream
 * @param {"local"||"remote"} kind
 * @returns {WrtcMediaStream}
 */
var WrtcMediaStream = function(stream, kind) {
  var self = new WebapiMediaStream(stream);
  //Attachable(self);
  //var self = this;

  //self.muted        = false;
  self.videoEnabled = true;
  self.audioEnabled = true;

  function setHandler(object, trackEventName, streamEventName, debugMethod) {
    object[trackEventName] = function(event) {
      debug[debugMethod]('WrtcMediaStream: mediaTrack.'+trackEventName+': kind: '+object.kind+', event:', event);
      self.emit(streamEventName, event);
    };
  }
  function setTracksDebug(tracks) {
    var i, len;
    for (len=tracks.length, i=0; i<len; ++i) {
      setHandler(tracks[i], 'onended',  'trackended',  'warn');
      setHandler(tracks[i], 'onmute',   'trackmute',   'log');
      setHandler(tracks[i], 'onoverconstrained', 'trackoverconstrained', 'warn');
      setHandler(tracks[i], 'onunmute', 'trackunmute', 'log');
    }
  }
  // Assign event handlers to stream tracks
  setTracksDebug(stream.getTracks());

  self.stop = function() {
    debug.log('WebapiMediaStream.stop()');
    self.emit('stop');
    self.detachAll();
    //stream.stop();
  };

  self.hasAudio = function() {
    return self.stream.getAudioTracks().length > 0;
  };

  self.setAudioEnabled = function(value) {
    debug.debug('WebapiMediaStream.setAudioEnabled('+value+')');
    self.audioEnabled = value;
    var audioTracks = self.stream.getAudioTracks();
    for ( var i = 0, l = audioTracks.length; i < l; i++ ) {
      audioTracks[i].enabled = value;
    }
  };

  self.toggleAudioEnabled = function() {
    debug.debug('WebapiMediaStream.toggleAudioEnabled()');
    self.setAudioEnabled( ! self.audioEnabled );
  };

  self.hasVideo = function() {
    return self.stream.getVideoTracks().length > 0;
  };

  self.setVideoEnabled = function(value) {
    // Muting for screencast is disabled
    // https://code.google.com/p/chromium/codesearch#chromium/src/third_party/libjingle/source/talk/media/webrtc/webrtcvideoengine.cc&q=Disable%20muting%20for%20screencast.&sq=package:chromium&type=cs&l=3232
    //
    debug.debug('WebapiMediaStream.setVideoEnabled('+value+')');
    self.videoEnabled = value;
    var tracks = self.stream.getVideoTracks();
    for ( var i = 0, l = tracks.length; i < l; i++ ) {
      tracks[i].enabled = value;
    }
  };

  self.toggleVideoEnabled = function() {
    // Muting for screencast is disabled
    // https://code.google.com/p/chromium/codesearch#chromium/src/third_party/libjingle/source/talk/media/webrtc/webrtcvideoengine.cc&q=Disable%20muting%20for%20screencast.&sq=package:chromium&type=cs&l=3232
    debug.debug('WebapiMediaStream.toggleVideoEnabled()');
    self.setVideoEnabled( ! self.videoEnabled );
  };

  self.setAudioEnabled(self.audioEnabled);

  self.setVideoEnabled(self.videoEnabled);

  /**
   * Print information on devices used for the stream
   */
  self._printInfo = function() {
    var i, msg, prefix = 'WrtcMediaStream._printInfo(): ';
    var audioTracks = self.stream.getAudioTracks();
    if (audioTracks.length > 0) {
      if (kind==='local' && audioTracks.length > 1) {
        debug.warn(prefix+'Expected 1 audio track for local stream.');
      }
      for (i = 0; i<audioTracks.length; i++) {
        debug.info(prefix+'Using Audio device (audioTracks[i].label): \'' + audioTracks[ i ].label + '\'');

        msg = prefix+'audioTracks[i].readyState: \'' + audioTracks[ i ].readyState + '\'';
        (audioTracks[ i ].readyState === 'ended') ? debug.warn(msg) : debug.log(msg);
      }
    } else {
      debug.warn(prefix+'stream does not contains audioTracks');
    }


    var videoTracks = self.stream.getVideoTracks();
    if (videoTracks.length > 0) {
      if (kind==='local' && videoTracks.length > 1) {
        debug.warn(prefix+'Expected 1 video track for local stream.');
      }
      for (i = 0; i<audioTracks.length; i++) {
        debug.info(prefix+'Using Video device (videoTracks[i].label): \'' + videoTracks[ i ].label + '\'');

        msg = prefix+'videoTracks[i].readyState: \'' + videoTracks[ i ].readyState + '\'';
        (videoTracks[ i ].readyState === 'ended') ? debug.warn(msg) : debug.log(msg);
      }
    } else {
      debug.warn(prefix+'stream does not contains videoTracks');
    }
  };

  return self;
};

//

if (typeof module !== 'undefined') {
  module.exports = WrtcMediaStream;
}

if (typeof window !== 'undefined') {
  window.WrtcMediaStream = WrtcMediaStream;
}
