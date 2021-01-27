/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { I18nextProvider } from 'react-i18next'; // as we build ourself via webpack
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { AmplifyAuthenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import {
  onAuthUIStateChange,
  CognitoUserInterface,
  AuthState
} from '@aws-amplify/ui-components';
import { bindActionCreators } from 'redux';
import i18n from '../services/i18n';
import { getCurrentTheme } from '-/reducers/settings';
import AppConfig from '-/config';
import awsconfig from '../aws-exports';
import { actions as AppActions } from '-/reducers/app';

const lightTheme = createMuiTheme({
  palette: {
    type: 'light', // Switching the dark mode on is a single property value change.
    primary: {
      light: AppConfig.lightThemeLightColor,
      main: AppConfig.lightThemeMainColor,
      dark: AppConfig.lightThemeMainColor,
      contrastText: '#ffffff'
    },
    secondary: {
      main: AppConfig.lightThemeMainColor
    },
    divider: '#ddd'
    // secondary: { main: '#cccccc', 200: '#ddd' }
  }
});

const darkTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: AppConfig.darkThemeLightColor,
      main: AppConfig.darkThemeMainColor,
      dark: AppConfig.darkThemeMainColor,
      contrastText: '#ffffff'
    },
    secondary: {
      main: AppConfig.darkThemeMainColor
    },
    divider: '#555'
    // secondary: { main: '#555', 200: '#777' }
  }
});

// const lightBlueTheme = createMuiTheme({
//   palette: {
//     type: 'light', // Switching the dark mode on is a single property value change.
//     primary: {
//       light: '#cbe9fa',
//       main: '#19aeff',
//       dark: '#19aeff',
//       contrastText: '#ffffff',
//     },
//     secondary: {
//       main: '#19aeff',
//     },
//     divider: '#ddd'
//     // secondary: { main: '#cccccc', 200: '#ddd' }
//   }
// });

interface Props {
  children: Object;
  currentTheme: string;
  loggedIn: (user: CognitoUserInterface) => void;
}
const App = (props: Props) => {
  React.useEffect(() => {
    onAuthUIStateChange((nextAuthState, authData) => {
      // setAuthState(nextAuthState);
      if (nextAuthState === AuthState.SignedIn) {
        // @ts-ignore
        props.loggedIn(authData);
      } else {
        props.loggedIn(undefined);
      }
    });
  }, []);

  let theme;
  switch (props.currentTheme) {
    case 'light': {
      theme = lightTheme;
      break;
    }
    case 'dark': {
      theme = darkTheme;
      break;
    }
    default: {
      theme = lightTheme;
      break;
    }
  }

  const themeProvider = (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>{props.children}</I18nextProvider>
      {/* <AppOnBoarding /> */}
    </ThemeProvider>
  );
  if (AppConfig.isWeb) {
    Amplify.configure(awsconfig);
    return <AmplifyAuthenticator>{themeProvider}</AmplifyAuthenticator>;
  }
  return themeProvider;
};

function mapStateToProps(state) {
  return {
    currentTheme: getCurrentTheme(state)
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      loggedIn: AppActions.loggedIn
    },
    dispatch
  );
}
export default connect(mapStateToProps, mapDispatchToProps)(App);
