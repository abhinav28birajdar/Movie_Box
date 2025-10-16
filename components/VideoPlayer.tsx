import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  PanResponder,
  Animated
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SavedMoviesService from '../../services/savedMoviesService';

interface VideoPlayerProps {
  videoUrl: string;
  movieId: number;
  title: string;
  poster?: string;
  onClose?: () => void;
}

interface PlaybackQuality {
  label: string;
  value: string;
  height: number;
}

const PLAYBACK_QUALITIES: PlaybackQuality[] = [
  { label: 'Auto', value: 'auto', height: 0 },
  { label: '480p', value: '480p', height: 480 },
  { label: '720p', value: '720p', height: 720 },
  { label: '1080p', value: '1080p', height: 1080 },
  { label: '4K', value: '4k', height: 2160 }
];

const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export default function VideoPlayer({ videoUrl, movieId, title, poster, onClose }: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const progressUpdateRef = useRef<NodeJS.Timeout>();
  
  // Video state
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Player controls state
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedQuality, setSelectedQuality] = useState<PlaybackQuality>(PLAYBACK_QUALITIES[0]);
  
  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [tempProgress, setTempProgress] = useState(0);
  
  // Animation values
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const volumeSliderOpacity = useRef(new Animated.Value(0)).current;
  
  // Screen dimensions
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('screen'));

  // Pan responder for volume control
  const volumePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setShowVolumeSlider(true);
      Animated.timing(volumeSliderOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    onPanResponderMove: (_, gestureState) => {
      const newVolume = Math.max(0, Math.min(1, volume + gestureState.dy / -200));
      setVolume(newVolume);
      videoRef.current?.setVolumeAsync(newVolume);
    },
    onPanResponderRelease: () => {
      setTimeout(() => {
        setShowVolumeSlider(false);
        Animated.timing(volumeSliderOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 2000);
    },
  });

  // Progress bar pan responder
  const progressPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDraggingProgress(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    },
    onPanResponderMove: (_, gestureState) => {
      const screenWidth = screenDimensions.width;
      const progress = Math.max(0, Math.min(1, gestureState.moveX / screenWidth));
      setTempProgress(progress);
    },
    onPanResponderRelease: () => {
      setIsDraggingProgress(false);
      const newPosition = tempProgress * duration;
      videoRef.current?.setPositionAsync(newPosition * 1000);
      setCurrentTime(newPosition);
      hideControlsAfterDelay();
    },
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ screen }) => {
      setScreenDimensions(screen);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Initialize video
    initializeVideo();
    
    // Update watch progress periodically
    const progressInterval = setInterval(() => {
      if (isPlaying && duration > 0) {
        const progress = (currentTime / duration) * 100;
        SavedMoviesService.updateWatchProgress(movieId, progress, duration);
      }
    }, 10000); // Update every 10 seconds

    return () => {
      clearInterval(progressInterval);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current);
      }
    };
  }, [movieId, isPlaying, currentTime, duration]);

  const initializeVideo = async () => {
    try {
      // Load saved progress
      const savedProgress = await SavedMoviesService.getMovieProgress(movieId);
      if (savedProgress && savedProgress.progress > 5) {
        const startPosition = (savedProgress.progress / 100) * savedProgress.duration;
        Alert.alert(
          'Resume Playback',
          `Do you want to resume from ${formatTime(startPosition)}?`,
          [
            { text: 'Start Over', onPress: () => {} },
            { 
              text: 'Resume', 
              onPress: () => {
                videoRef.current?.setPositionAsync(startPosition * 1000);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error initializing video:', error);
    }
  };

  const onPlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);
    
    if (playbackStatus.isLoaded) {
      setIsLoading(false);
      setIsPlaying(playbackStatus.isPlaying || false);
      setIsMuted(playbackStatus.isMuted || false);
      setVolume(playbackStatus.volume || 1.0);
      setCurrentTime((playbackStatus.positionMillis || 0) / 1000);
      setDuration((playbackStatus.durationMillis || 0) / 1000);
      setIsBuffering(playbackStatus.isBuffering || false);
      
      if (playbackStatus.didJustFinish) {
        onVideoEnd();
      }
    } else if (playbackStatus.error) {
      setError(playbackStatus.error);
      setIsLoading(false);
    }
  };

  const onVideoEnd = async () => {
    // Mark as completed and add to watch history
    await SavedMoviesService.updateWatchProgress(movieId, 100, duration);
    Alert.alert(
      'Video Completed',
      'Would you like to rate this movie?',
      [
        { text: 'Not Now', onPress: () => {} },
        { text: 'Rate Movie', onPress: () => showRatingDialog() }
      ]
    );
  };

  const showRatingDialog = () => {
    // This would open a rating modal - simplified for now
    Alert.alert('Rating', 'Rating feature would be implemented here');
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const toggleMute = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMuted);
    }
  };

  const changeVolume = async (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (videoRef.current) {
      await videoRef.current.setVolumeAsync(clampedVolume);
    }
  };

  const changePlaybackSpeed = async (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (videoRef.current) {
      await videoRef.current.setRateAsync(speed, true);
    }
  };

  const changeQuality = (quality: PlaybackQuality) => {
    setSelectedQuality(quality);
    setShowQualityMenu(false);
    // In a real implementation, you would change the video source here
    Alert.alert('Quality Change', `Changed to ${quality.label}. This would change the video source in a real implementation.`);
  };

  const seekTo = async (seconds: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(seconds * 1000);
    }
  };

  const skip = async (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    await seekTo(newTime);
  };

  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        StatusBar.setHidden(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        StatusBar.setHidden(true);
      }
      setIsFullscreen(!isFullscreen);
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    hideControlsAfterDelay();
  };

  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    }, 5000);
  };

  const handlePlayerTouch = () => {
    if (showControls) {
      if (isPlaying) {
        setShowControls(false);
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    } else {
      showControlsTemporarily();
    }
  };

  const handleClose = async () => {
    try {
      // Save current progress before closing
      if (duration > 0) {
        const progress = (currentTime / duration) * 100;
        await SavedMoviesService.updateWatchProgress(movieId, progress, duration);
      }
      
      // Reset orientation
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      StatusBar.setHidden(false);
      
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Error closing player:', error);
      router.back();
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (isDraggingProgress) {
      return tempProgress * 100;
    }
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  if (error) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-white text-xl mt-4 mb-2">Playback Error</Text>
        <Text className="text-gray-400 text-center px-6 mb-6">{error}</Text>
        <TouchableOpacity 
          className="bg-blue-600 px-6 py-3 rounded-lg"
          onPress={handleClose}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <TouchableOpacity 
        className="flex-1"
        activeOpacity={1}
        onPress={handlePlayerTouch}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          className="flex-1"
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          isLooping={false}
          volume={volume}
          isMuted={isMuted}
          rate={playbackSpeed}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          useNativeControls={false}
        />

        {/* Loading Indicator */}
        {(isLoading || isBuffering) && (
          <View className="absolute inset-0 justify-center items-center">
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text className="text-white mt-2">
              {isLoading ? 'Loading...' : 'Buffering...'}
            </Text>
          </View>
        )}

        {/* Controls Overlay */}
        <Animated.View 
          className="absolute inset-0"
          style={{ opacity: controlsOpacity }}
          pointerEvents={showControls ? 'auto' : 'none'}
        >
          {/* Top Controls */}
          <View className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 pt-12">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="arrow-back" size={28} color="white" />
              </TouchableOpacity>
              <View className="flex-1 mx-4">
                <Text className="text-white text-lg font-bold" numberOfLines={1}>
                  {title}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowQualityMenu(true)}>
                <Text className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                  {selectedQuality.label}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Center Controls */}
          <View className="absolute inset-0 justify-center items-center">
            <View className="flex-row items-center space-x-8">
              <TouchableOpacity onPress={() => skip(-10)}>
                <Ionicons name="play-back" size={48} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={togglePlayPause}
                className="bg-white/20 rounded-full p-4"
              >
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={48} 
                  color="white" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => skip(10)}>
                <Ionicons name="play-forward" size={48} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Controls */}
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <View 
              className="h-1 bg-white/30 rounded-full mb-4"
              {...progressPanResponder.panHandlers}
            >
              <View 
                className="h-full bg-red-600 rounded-full"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </View>

            {/* Time and Controls */}
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
              
              <View className="flex-row items-center space-x-4">
                <TouchableOpacity onPress={() => setShowSpeedMenu(true)}>
                  <Text className="text-white text-sm">{playbackSpeed}x</Text>
                </TouchableOpacity>
                
                <View {...volumePanResponder.panHandlers}>
                  <TouchableOpacity onPress={toggleMute}>
                    <Ionicons 
                      name={isMuted ? "volume-mute" : volume > 0.5 ? "volume-high" : "volume-low"} 
                      size={24} 
                      color="white" 
                    />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity onPress={toggleFullscreen}>
                  <Ionicons 
                    name={isFullscreen ? "contract" : "expand"} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Volume Slider */}
        <Animated.View 
          className="absolute right-6 top-1/2 transform -translate-y-12"
          style={{ opacity: volumeSliderOpacity }}
          pointerEvents={showVolumeSlider ? 'auto' : 'none'}
        >
          <View className="bg-black/80 p-2 rounded-lg h-32 justify-center">
            <View className="w-1 bg-white/30 h-24 rounded-full mx-auto">
              <View 
                className="w-full bg-white rounded-full"
                style={{ height: `${volume * 100}%`, marginTop: 'auto' }}
              />
            </View>
            <Text className="text-white text-xs text-center mt-1">
              {Math.round(volume * 100)}%
            </Text>
          </View>
        </Animated.View>

        {/* Speed Menu */}
        {showSpeedMenu && (
          <View className="absolute inset-0 bg-black/50 justify-center items-center">
            <View className="bg-gray-800 rounded-lg p-4 min-w-48">
              <Text className="text-white text-lg font-bold text-center mb-4">
                Playback Speed
              </Text>
              {PLAYBACK_SPEEDS.map((speed) => (
                <TouchableOpacity
                  key={speed}
                  className={`py-3 px-4 rounded ${speed === playbackSpeed ? 'bg-blue-600' : ''}`}
                  onPress={() => changePlaybackSpeed(speed)}
                >
                  <Text className="text-white text-center">
                    {speed === 1 ? 'Normal' : `${speed}x`}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                className="mt-4 py-2 px-4 bg-gray-600 rounded"
                onPress={() => setShowSpeedMenu(false)}
              >
                <Text className="text-white text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quality Menu */}
        {showQualityMenu && (
          <View className="absolute inset-0 bg-black/50 justify-center items-center">
            <View className="bg-gray-800 rounded-lg p-4 min-w-48">
              <Text className="text-white text-lg font-bold text-center mb-4">
                Video Quality
              </Text>
              {PLAYBACK_QUALITIES.map((quality) => (
                <TouchableOpacity
                  key={quality.value}
                  className={`py-3 px-4 rounded ${quality.value === selectedQuality.value ? 'bg-blue-600' : ''}`}
                  onPress={() => changeQuality(quality)}
                >
                  <Text className="text-white text-center">
                    {quality.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                className="mt-4 py-2 px-4 bg-gray-600 rounded"
                onPress={() => setShowQualityMenu(false)}
              >
                <Text className="text-white text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}