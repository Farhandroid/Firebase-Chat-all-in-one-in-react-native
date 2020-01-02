import React from 'react';
import ShowAllConnectedUserScreen from './component/screen/ShowAllConnectedUserScreen/ShowAllConnectedUserScreen';
import LoginScreen from './component/screen/LoginScreen/LoginScreen';
import ChatScreen from './component/screen/ChatScreen/Chatscreen';
import ShowUserChattedUserList from './component/screen/ShowUserChattedUserList/ShowUserChattedUserList';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Header from './component/screen/Header/header';
import {YellowBox} from 'react-native';

YellowBox.ignoreWarnings([
  'Setting a timer',
  'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?',
  'Remote debugger is in a background tab which may cause apps to perform slowly. Fix this by foregrounding the tab (or opening it in a separate window)',
  'Setting a timer for a long period of time, i.e. multiple minutes, is a performance and correctness issue on Android as it keeps the timer module awake, and timers can only be called when the app is in the foreground. See https://github.com/facebook/react-native/issues/12981 for more info.(Saw setTimeout with duration 463076ms)',
]);

const AppNavigator = createStackNavigator(
  {
    Login: {
      screen: LoginScreen,
      navigationOptions: {
        header: null,
      },
    },
    ShowAllConnectedUser: {
      screen: ShowAllConnectedUserScreen,
      navigationOptions: {
        /// header : null;
        headerTitle: () => <Header title={'All user'} />,
        headerLeft: null,
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 1.5, // remove shadow on Android
          shadowOpacity: 0, // remove shadow on iOS
        },
      },
    },
    Chat: {
      screen: ChatScreen,
      navigationOptions: {
        /// header : null;
        headerTitle: () => <Header title={'ChatScreen'} />,
        headerLeft: null,
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 1.5, // remove shadow on Android
          shadowOpacity: 0, // remove shadow on iOS
        },
      },
    },

    ShowUserChattedUserList: {
      screen: ShowUserChattedUserList,
      navigationOptions: {
        /// header : null;
        headerTitle: () => <Header title={'UserChatted'} />,
        headerLeft: null,
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 1.5, // remove shadow on Android
          shadowOpacity: 0, // remove shadow on iOS
        },
      },
    },
  },
  // {
  //   defaultNavigationOptions: {
  //     header: null,
  //   },
  // },
);

export default createAppContainer(AppNavigator);
