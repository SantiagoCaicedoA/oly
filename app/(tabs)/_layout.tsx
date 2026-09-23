import { TabLoaderProvider, useTabLoader } from "@/components/tab-loader";
import { OlyIcon, OlyIconName } from "@/components/icons/OlyIcon";
import { olyColors, olyPalette } from "@/src/oly-theme/oly-colors";
import { olyRadius } from "@/src/oly-theme/oly-radius";
import { olyElevation } from "@/src/oly-theme/oly-elevation";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React, { createContext, useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

/**
 * Tab bar.
 *
 * Design system: Iconography, and Layout / TabBar.
 *
 * Five tabs, in this order: Home, Rank, Messages, Search, Profile.
 *
 * Rules this file implements:
 *  - No labels. Position and persistence teach the tabs, so every
 *    screen carries an accessibility label instead.
 *  - Outline when inactive, filled when active. Search is the one
 *    exception; a filled magnifier reads as a lollipop, so it keeps
 *    its outline and thickens to 2.2.
 *  - Nothing sits behind an active icon. No disc, no pill, no
 *    background. The Design Bible's `bg-active-highlight` disc put a
 *    primary icon on a primary tint at 1.43:1, which could not be seen.
 *  - No centre FAB. Posting a lift moved to the header on Home, beside
 *    notifications. A floating button over the feed covered content and
 *    made the bar asymmetric for one action.
 *
 * Messages and Search are placeholder screens. Neither feature has an
 * endpoint yet. See the note at the top of each file.
 */

export const TabBarContext = createContext({
  hideTabBar: () => {},
  showTabBar: () => {},
});

/* Iconography / Sizes. 28 is `icon-tab`, one step above `icon-md`.
   A floating bar sits further from the thumb than a flush one, so the
   glyph carries more weight here than it does in a list row. */
const ICON_SIZE = 28;
/* Layout / TabBar.
   60, not the iOS standard 49. That number assumes a bar flush with the
   bottom edge, where the home indicator supplies the lower gutter. This
   bar floats, so it has to supply its own on both sides. 28 for the
   glyph and a 16 gutter above and below, which is `screenPadding`, the
   same gutter the content uses. */
const TAB_BAR_HEIGHT = 60;
const TAB_BAR_MARGIN_BOTTOM = 28;
const TAB_BAR_MARGIN_H = 14;

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <TabLoaderProvider>
        <TabsWithLoader />
      </TabLoaderProvider>
    </GestureHandlerRootView>
  );
}

function TabsWithLoader() {
  const [isTabBarVisible] = useState(true);
  const { show } = useTabLoader();

  // branded loader on the first open of the tabs
  useEffect(() => {
    show();
  }, [show]);

  // shown before opening a tab that fetches
  const loaderListeners = { tabPress: () => show() };

  /**
   * The button is drawn here rather than through `tabBarIcon`.
   *
   * `BottomTabItem` puts `tabBarItemStyle` on an outer wrapper, then
   * renders an inner pressable whose style is hardcoded to
   * `justifyContent: "flex-start"` with `padding: 5`. No prop reaches
   * it. The icon therefore pins to the top of the item and the leftover
   * height falls below it, which reads as the old label slot still
   * being there. Replacing the button is the only way to centre it.
   */
  const tab = (name: OlyIconName, label: string) => ({
    title: label,
    tabBarButton: (props: BottomTabBarButtonProps) => {
      const focused = !!props["aria-selected"];
      return (
        <Pressable
          onPress={props.onPress}
          onLongPress={props.onLongPress}
          android_ripple={{ borderless: true }}
          accessibilityRole="button"
          accessibilityState={{ selected: focused }}
          accessibilityLabel={label}
          style={styles.tabButton}
        >
          <OlyIcon
            name={name}
            size={ICON_SIZE}
            filled={focused}
            color={focused ? olyColors.text.primary : olyColors.text.secondary}
          />
        </Pressable>
      );
    },
  });

  return (
    <BottomSheetModalProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: olyPalette.background },
          /* Matches Layout / TabBar exactly. Height 49, elevation 1 fill,
             a full 1px border-default on all four sides rather than a top
             border only, radius lg. No horizontal padding: the five items
             each take a fifth of the width and centre their own glyph. */
          tabBarStyle: isTabBarVisible
            ? {
                position: "absolute",
                height: TAB_BAR_HEIGHT,
                marginHorizontal: TAB_BAR_MARGIN_H,
                marginBottom: TAB_BAR_MARGIN_BOTTOM,
                backgroundColor: olyElevation.level1.backgroundColor,
                borderRadius: olyRadius.lg,
                borderWidth: 1,
                borderColor: olyColors.border.default,
                /* RN draws the top border of a tab bar separately. */
                borderTopWidth: 1,
                borderTopColor: olyColors.border.default,
                overflow: "hidden",
                elevation: 0,
                shadowOpacity: 0,
                /* The bar floats clear of the home indicator, so the safe
                   area inset must not be added inside it. Left in, it pads
                   the bottom and pushes every icon upward. */
                paddingTop: 0,
                paddingBottom: 0,
                paddingHorizontal: 0,
              }
            : { display: "none" },
          /* The outer wrapper only. The glyph is centred by the button
             this file renders, not by these.

             No height here. The bar is 60 including its 1px borders, so
             its content box is 58. A child pinned to 60 overflows by 2
             and lands off centre, which reads as the glyph sitting low.
             Stretching to the content box is what centres it. */
          tabBarItemStyle: {
            flex: 1,
            margin: 0,
            padding: 0,
          },
          tabBarShowLabel: false,
          animation: "none",
        }}
      >
        <Tabs.Screen
          name="home"
          listeners={loaderListeners}
          options={tab("home", "Home")}
        />

        <Tabs.Screen
          name="rank"
          listeners={loaderListeners}
          options={tab("rank", "Rank")}
        />

        <Tabs.Screen name="messages" options={tab("messages", "Messages")} />

        <Tabs.Screen name="search" options={tab("search", "Search")} />

        <Tabs.Screen
          name="profile"
          listeners={loaderListeners}
          options={tab("profile", "Profile")}
        />

        {/* AI training is out of the MVP: route stays, tab is hidden. */}
        <Tabs.Screen name="workout" options={{ href: null }} />

        {/* The old centre FAB. Posting lives in the Home header now. */}
        <Tabs.Screen name="upload" options={{ href: null }} />

        {/* stub kept only until the file is deleted */}
        <Tabs.Screen name="analytics" options={{ href: null }} />
      </Tabs>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  /* Fills the item and centres the glyph on both axes. No padding,
     so the icon sits on the bar's true vertical centre. */
  tabButton: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
});
