import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import firebase from 'firebase';
import AsyncStorage from '@react-native-community/async-storage';

export default class ShowAllConnectedUserScreen extends Component {
  constructor(props) {
    super(props);
    this.init();
    this.state = {
      isLoading: true,
      connectedUserData: [],
      userName: '',
    };
  }

  init = () => {
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: 'AIzaSyB9jDwkJKV2L2pka0o9FAzYoa4TiFNsU2s',
        authDomain: 'testchatting-6a960.firebaseapp.com',
        databaseURL: 'https://testchatting-6a960.firebaseio.com',
        projectId: 'testchatting-6a960',
        storageBucket: 'testchatting-6a960.appspot.com',
        messagingSenderId: '362438143885',
        appId: '1:362438143885:web:12874454c98ba8cebe57c4',
        measurementId: 'G-ZWGY1VF0H3',
      });
    }
  };

  componentDidMount() {
    this.readUserData();
  }

  readUserData = () => {
    var tasks = [];
    let self = this;
    firebase
      .database()
      .ref('UsersList/')
      .on('value', function(snapshot) {
        snapshot.forEach(child => {
          var data = {};
          data['status'] = child.val().status;
          data['userId'] = child.val().userId;
          data['userName'] = child.val().userName;
          tasks.push(data);
        });

        self.setState(
          {
            connectedUserData: tasks,
          },
          function() {
            self.getUserName();
          },
        );
      });
  };

  listenForMessageReceives = () => {
    let instance = this;
    var tasksRef = 'UsersList/';

    firebase
      .database()
      .ref(tasksRef)
      .on('value', dataSnapshot => {
        console.log(
          'data in listenForMessageReceive: ' + JSON.stringify(dataSnapshot),
        );
        var tasks = [];
        dataSnapshot.forEach(child => {
          var data = {};
          data['status'] = child.val().status;
          data['userId'] = child.val().userId;
          data['userName'] = child.val().userName;
          tasks.push(data);
        });

        instance.setState({
          connectedUserData: tasks,
        });
      });
  };

  startChatScreen(
    messageSenderUserName,
    messageSenderUserId,
    messageReceiverUserName,
    messageReceiverUserId,
  ) {
    this.props.navigation.navigate('Chat', {
      messageSenderUserName,
      messageSenderUserId,
      messageReceiverUserName,
      messageReceiverUserId,
    });
  }

  getUserName = () => {
    let instance = this;
    instance.setState(
      {
        userName: instance.props.navigation.getParam('userName', 'N/A'),
      },
      function() {
        instance.listenForMessageReceives();
      },
    );
  };

  getDataFromAsyncstorage = async (
    messageReceiverUserName,
    messageReceiverUserId,
  ) => {
    try {
      const userName = await AsyncStorage.getItem('@storage_username');
      const userId = await AsyncStorage.getItem('@storage_userId');

      console.log('userName getDataFromAsyncstorage : ' + userName);
      console.log('userId getDataFromAsyncstorage : ' + userId);

      if (userName !== null && userId !== null) {
        this.startChatScreen(
          userName,
          userId,
          messageReceiverUserName,
          messageReceiverUserId,
        );
      }
    } catch (e) {
      console.log('error is asyncstorage : ' + e.toString());
    }
  };

  renderItem = ({item}) => {
    if (item.userName == this.state.userName) {
      return <View></View>;
    } else {
      return (
        <TouchableOpacity
          onPress={() =>
            this.getDataFromAsyncstorage(item.userName, item.userId)
          }>
          <View style={styles.row}>
            {/*   {<Image source={{ uri: item.image }} style={styles.pic} />} */}
            <View>
              <View style={styles.nameContainer}>
                <Text
                  style={styles.nameTxt}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item.userName}
                </Text>
                <Text style={styles.mblTxt}>Mobile</Text>
              </View>
              <View style={styles.msgContainer}>
                <Text style={styles.msgTxt}>Active</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        {!this.state.loading && (
          <FlatList
            data={this.state.connectedUserData}
            keyExtractor={item => {
              return item.socketId;
            }}
            renderItem={this.renderItem}></FlatList>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DCDCDC',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    padding: 10,
  },
  pic: {
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 280,
  },
  nameTxt: {
    marginLeft: 15,
    fontWeight: '600',
    color: '#222',
    fontSize: 18,
    width: 170,
  },
  mblTxt: {
    fontWeight: '200',
    color: '#777',
    fontSize: 13,
  },
  msgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgTxt: {
    fontWeight: '400',
    color: '#008B8B',
    fontSize: 12,
    marginLeft: 15,
  },
});
