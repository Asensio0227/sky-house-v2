import { AudioPlayer, createAudioPlayer } from 'expo-audio';

let currentPlayer: AudioPlayer | null = null;

export const AudioManager = {
  play: async (source: any) => {
    if (currentPlayer) {
      await currentPlayer.pause();
      currentPlayer.release();
    }

    currentPlayer = createAudioPlayer(source);
    await currentPlayer.play();
  },

  stopCurrent: async () => {
    if (currentPlayer) {
      await currentPlayer.pause();
      currentPlayer.release();
      currentPlayer = null;
    }
  },

  getCurrent: () => currentPlayer,
};
