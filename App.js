import React, {Component} from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Alert,
  FlatList,
  ScrollView,
  ImageBackground,
  StatusBar,
} from 'react-native';

import Swiper from 'react-native-swiper';
import Dialog from 'react-native-dialog';
import moment from 'moment';

const platform = Platform.OS;
const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;
console.log(
  `platform=${platform}deviceHeight=${deviceHeight}deviceWidth=${deviceWidth}`,
);

const DailyForecast = ({item}) => (
  <View style={styles.viewGroupDaysOfWeek}>
    <View style={[styles.viewGroupDaysOfWeek, styles.viewDaysOfWeek]}>
      <Text style={styles.textItem}>{item ? item.date : ''}</Text>
    </View>
    <View style={styles.viewWeather}>
      <Image
        source={item ? getIcon(item.weather) : ''}
        style={styles.iconStyleWeather}
      />
    </View>
    <View style={[styles.viewGroupDaysOfWeek, styles.viewTemperature]}>
      <Text style={styles.textItem}>
        {item ? item.lowTemp + '°C/' + item.highTemp + '°C' : ''}
      </Text>
    </View>
  </View>
);

const getIcon = (name: string) => {
  switch (name) {
    case '01d':
      return require('./pictures/01d.png');
    case '01n':
      return require('./pictures/01n.png');
    case '04d':
      return require('./pictures/04d.png');
    case '04n':
      return require('./pictures/04n.png');
    case '03d':
      return require('./pictures/03d.png');
    case '03n':
      return require('./pictures/03n.png');
    case '02d':
      return require('./pictures/02d.png');
    case '02n':
      return require('./pictures/02n.png');
    case '09d':
      return require('./pictures/09d.png');
    case '09n':
      return require('./pictures/09n.png');
    case '10d':
      return require('./pictures/10d.png');
    case '10n':
      return require('./pictures/10n.png');
    case '11d':
      return require('./pictures/11d.png');
    case '11n':
      return require('./pictures/11n.png');
    case '13d':
      return require('./pictures/13d.png');
    case '13n':
      return require('./pictures/13n.png');
    case '50d':
      return require('./pictures/50d.png');
    case '50n':
      return require('./pictures/50n.png');
    default:
      return require('./pictures/notfound.png');
  }
};

export default class App extends Component {
  state = {
    dialogVisible: false,
    cityName: '',
    weatherData: null,
    dailyForecast: [],
    hourlyForecast: [],
  };

  showDialog = () => {
    this.setState({dialogVisible: true});
  };

  handleCancel = () => {
    this.setState({dialogVisible: false});
  };
  handleInput = (text) => {
    this.setState({cityName: text});
  };

  handleSubmit = async () => {
    let i = await this.getDataFromApi(this.state.cityName);
    if (i.cod === "404") {
      Alert.alert('We can not find the city');
    } else {
      await this.setState({weatherData: i});
      await this.setState({
        dailyForecast: await this.getForecastDaily(
          this.state.weatherData.coord.lat,
          this.state.weatherData.coord.lon,
        ),
      });
      this.setState({dialogVisible: false});
    }
  };

  async getDataFromApi(name: string) {
    try {
      let response = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?q=${name}&appid=0f05330fccb3c95dc3fc203769b15aaf`,
      );
      let responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.error(error);
    }
  }

  async getForecastDaily(lat, lon: number) {
    try {
      let response = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,current&appid=0f05330fccb3c95dc3fc203769b15aaf`,
      );
      let responseJson = await response.json();
      let date = new Date();
      let list = [];
      for (let i = 0; i < responseJson.daily.length; i++) {
        list.push({
          date: moment(date).add(i, 'day').format('ddd, DD/MM'),
          lowTemp: parseInt(responseJson.daily[i].temp.min) - 273,
          highTemp: parseInt(responseJson.daily[i].temp.max) - 273,
          weather: responseJson.daily[i].weather[0].icon,
        });
      }
      return list;
    } catch (error) {
      console.error(error);
    }
  }
  async getForecastHourly(lat, lon: number) {
    try {
      let response = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,current&appid=0f05330fccb3c95dc3fc203769b15aaf`,
      );
      let responseJson = await response.json();
      return responseJson;
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <ImageBackground
        source={require('./pictures/background.png')}
        style={{
          flex: 1,
          resizeMode: 'cover',
          backgroundColor: 'transparent',
        }}>
        <StatusBar
          backgroundColor={platform === 'ios' ? 'transparent' : '#fff'}
          barStyle="light-content"
        />
        <View style={styles.headerStyle}>
          <Text style={styles.textHeader}>{this.state.cityName}</Text>
          <TouchableOpacity onPress={this.showDialog}>
            <Image
              style={{width: 25, height: 25}}
              source={require('./pictures/city.png')}
            />
          </TouchableOpacity>
          <Dialog.Container visible={this.state.dialogVisible}>
            <Dialog.Title>City search</Dialog.Title>
            <Dialog.Description>
              Enter a city to learn about its weather.
            </Dialog.Description>
            <Dialog.Input
              placeholder="Ha Noi"
              onChangeText={this.handleInput}
              onSubmitEditing={this.handleSubmit}
              clearButtonMode="while-editing"
              autoCorrect={false}
            />
            <Dialog.Button label="Cancel" onPress={this.handleCancel} />
            <Dialog.Button label="Submit" onPress={this.handleSubmit} />
          </Dialog.Container>
        </View>
        <ScrollView>
          <View style={styles.containerStyle}>
            <View style={styles.viewTemperature}>
              <Text style={styles.textTemperature}>
                {this.state.weatherData
                  ? parseInt(this.state.weatherData.main.temp - 273) + '°C'
                  : ''}
              </Text>
              <Text style={styles.textWeather}>
                {this.state.weatherData
                  ? this.state.weatherData.weather[0].description
                  : ''}
              </Text>
              <Image
                style={styles.viewTemperature}
                source={
                  this.state.weatherData
                    ? getIcon(this.state.weatherData.weather[0].icon)
                    : ''
                }
              />
              <FlatList
                data={this.state.dailyForecast}
                keyExtractor={(item) => item.date}
                renderItem={({item}) => <DailyForecast item={item} />}
              />
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }
}
const styles = StyleSheet.create({
  textHeader: {
    flex: 1,
    color: '#ffff',
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontSize: 30,
    marginStart: 42,
    textTransform: 'capitalize',
  },
  headerStyle: {
    flexDirection: 'row',
    height: 50,
    width: '100%',
    marginTop: platform === 'ios' ? 30 : 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  containerStyle: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  textTemperature: {
    color: '#ffff',
    fontSize: 100,
    fontWeight: '100',
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  viewTemperature: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  textWeather: {
    color: '#ffff',
    fontSize: 30,
    textAlign: 'center',
    textTransform: 'capitalize',
  },

  iconStyleWeather: {
    height: 36,
    width: 36,
  },

  viewGroupDaysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  textItem: {
    color: '#ffff',
    fontSize: 16,
    fontStyle: 'normal',
    backgroundColor: 'transparent',
    padding: 3,
  },

  viewDivider: {
    backgroundColor: '#ffffff90',
    height: 1,
    width: '100%',
  },

  viewDaysOfWeek: {
    width: '33%',
  },

  viewWeather: {
    width: '33%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
