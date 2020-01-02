/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  Image,
  Text,
  View,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {withNavigation} from 'react-navigation';

class LogoTitle extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.leftContainer} />
        <View style={styles.middleContainer}>
          <Text style={{fontSize: 20, color: '#fff'}}>{this.props.title}</Text>
        </View>
        <TouchableOpacity
          style={styles.endContainer}
          onPress={() =>
            this.props.navigation.navigate('ShowUserChattedUserList')
          }>
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#00b5ec',
    height: '100%',
    //justifyContent: 'space-between',
    ///backgroundColor: Constant.toolbarColor,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    ///backgroundColor: '#000',
  },
  middleContainer: {
    flex: 3,
    flexDirection: 'row',
    marginLeft: -8,
    justifyContent: 'center',
    fontSize: 17,
    fontFamily: 'DINNeuzeitGrotesk-Light',
    ///fontWeight: 'bold',
    //backgroundColor: 'red',
    textAlign: 'center',
  },
  endContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 16,
    ///backgroundColor: 'green',
  },
});

export default withNavigation(LogoTitle);
