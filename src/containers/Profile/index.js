import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ProfileDetails from './ProfileDetails';
import { ExplorerBody } from 'containers';
import FilterNav from 'containers/FilterNav';
import styles from './Profile.module.scss';
import { SideOverlay, ZeroState } from 'components';
import { actions as bountiesActions } from 'public-modules/Bounties';
import { actions as userInfoActions } from 'public-modules/UserInfo';
import { userInfoSelector } from 'public-modules/UserInfo/selectors';
import { getCurrentUserSelector } from 'public-modules/Authentication/selectors';
import { actions } from './reducer';

import { StickyContainer, Sticky } from 'react-sticky';

class ProfileComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mobileFilterVisible: false
    };

    const {
      currentUser,
      history,
      match,
      loadUserInfo,
      setActiveTab,
      setProfileAddress,
      resetState
    } = this.props;

    let address = match.params.address;
    if (!address) {
      address = currentUser.public_address;

      // This anti-pattern is here in the constructor in order to simplify the
      // routing logic. We were unable to use a react-router-dom redirect
      // because the user needs to still hit the /profile page if they aren't
      // logged in. Even if they were to hit that page and login it wouldn't
      // have correctly redirect because not LOCATION_CHANGED event would be
      // dispatched after logging through the login hoc.
      history.replace(`/profile/${address}/`);
      return;
    }

    resetState();
    loadUserInfo(address.toLowerCase());
    setProfileAddress(address.toLowerCase());
    setActiveTab('issued');
  }

  render() {
    const { error, loaded, user } = this.props;

    const profileFilterNav = (
      <FilterNav
        config={{
          search: false,
          stage: true,
          difficulty: false,
          category: false
        }}
        resetFilters={{
          address: false,
          search: true,
          stage: true,
          difficulty: true,
          category: true
        }}
        defaultStageFilters={{
          active: false,
          completed: false,
          expired: false,
          dead: false
        }}
      />
    );

    let body = (
      <div className={styles.profileContainer}>
        <div className={`${styles.profileDetails}`}>
          <ProfileDetails />
        </div>
        <div className={styles.profileBountiesContainer}>
          <div className={styles.profileBounties}>
            <div className={styles.desktopFilter}>{profileFilterNav}</div>
            <div className={styles.mobileFilter}>
              <SideOverlay
                hasMask
                visible={this.state.mobileFilterVisible}
                theme="light"
                position="right"
                onClose={() => this.setState({ mobileFilterVisible: false })}
              >
                {profileFilterNav}
              </SideOverlay>
            </div>

            <ExplorerBody
              className={styles.explorerBody}
              onOpenFilters={() => this.setState({ mobileFilterVisible: true })}
            />
          </div>
        </div>
      </div>
    );

    if (loaded && !user) {
      body = (
        <div className={`fullHeight ${styles.zeroStateCentered}`}>
          <ZeroState
            className={styles.centeredItem}
            iconColor="blue"
            title="No User Found"
            text="Check that the address is correct and try again"
            icon={['fal', 'bolt']}
          />
        </div>
      );
    }

    if (error) {
      body = (
        <div className={`fullHeight ${styles.zeroStateCentered}`}>
          <ZeroState
            className={styles.centeredItem}
            iconColor="red"
            title="Error"
            text="Please try again"
            icon={['fal', 'bolt']}
          />
        </div>
      );
    }

    return body;
  }
}

const mapStateToProps = state => {
  const currentUser = getCurrentUserSelector(state);
  const userInfo = userInfoSelector(state);

  return {
    currentUser,
    user: userInfo.loadedUser.user,
    loading: userInfo.loading,
    loaded: userInfo.loaded,
    error: userInfo.error
  };
};

const Profile = compose(
  withRouter,
  connect(
    mapStateToProps,
    {
      resetState: bountiesActions.resetState,
      loadUserInfo: userInfoActions.loadUserInfo,
      setActiveTab: actions.setActiveTab,
      setProfileAddress: actions.setProfileAddress
    }
  )
)(ProfileComponent);

export default Profile;
