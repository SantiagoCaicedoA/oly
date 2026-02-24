import { TabBarContext } from "@/app/(tabs)/_layout";
import { Images } from "@/assets";
import { useTheme } from "@/context/theme-context";
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useContext, useMemo } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import CommentCard from "./comment-card";

const CommentBottomSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const { colors } = useTheme();

  const snapPoints = useMemo(() => ["50%", "90%"], []);
  const { hideTabBar, showTabBar } = useContext(TabBarContext);

  const styles = StyleSheet.create({
    contentContainer: {
      paddingHorizontal: scale(10),
    },
    footer: {
      borderTopColor: colors.text,
      borderTopWidth: scale(1),
      backgroundColor: colors.headerBackground,
      paddingHorizontal: scale(10),
      paddingVertical: scale(20),
      paddingBottom: Platform.OS === "ios" ? scale(10) : scale(10),
    },
    messageContainer: {
      flex: 1,
      borderColor: colors.text,
      borderWidth: scale(1),
      borderRadius: scale(15),
      padding: scale(15),
      color: colors.text,
    },
    sendIcon: {
      width: scale(20),
      height: scale(20),
    },
    sendContainer: {
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      borderWidth: scale(1),
      borderRadius: scale(25),
      alignItems: "center",
      justifyContent: "center",
      padding: scale(12),
    },
  });

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={styles.footer}>
          <View
            style={{
              flexDirection: "row",
              gap: scale(5),
              alignItems: "center",
            }}
          >
            <BottomSheetTextInput
              style={styles.messageContainer}
              placeholder="Message"
              placeholderTextColor={colors.textSecondary}
            />

            <TouchableOpacity style={styles.sendContainer}>
              <Image source={Images.send} style={styles.sendIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetFooter>
    ),
    [colors, styles],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      enableDynamicSizing={false}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.text }}
      footerComponent={renderFooter}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      enablePanDownToClose={true}
      enableDismissOnClose={true}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CommentCard />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default CommentBottomSheet;
