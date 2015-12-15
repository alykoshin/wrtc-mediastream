'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('mini-debug');
  var WebapiMediaStream = require('webapi-mediastream');
}

/**
 *
 * @constructor
 * @extends WebapiMediaStream
 * @param {MediaStream} stream
 * @returns {WrtcMediaStream}
 */
var WrtcMediaStream = function(stream) {
  var self = WebapiMediaStream(stream);
  //var self = this;

  self.muted        = false;
  self.videoEnabled = true;
  self.audioEnabled = true;

  self.stop = function() {
    debug.log('WebapiMediaStream.stop()');
    self.emit('stop');
    stream.stop();
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

  return self;
};

//

if (typeof module !== 'undefined') {
  module.exports = WrtcMediaStream;
}

if (typeof window !== 'undefined') {
  window.WrtcMediaStream = WrtcMediaStream;
}
