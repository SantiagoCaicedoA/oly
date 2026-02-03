import { Images } from "@/assets";
import Context from "@/components/context";
import DetailLift from "@/components/detail-lift";
import Effort from "@/components/effort";
import { useTheme } from "@/context/theme-context";
import { Typography } from "@/utils/custom-styles";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
export default function PostExpanded() {
  const { colors } = useTheme();

  const handleBackPress = () => {
    router.back();
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingVertical: scale(15),
      paddingHorizontal: scale(14),
    },
    image: {
      width: "100%",
      height: scale(400),
      borderRadius: scale(12),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: scale(6),
    },
    profile: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      marginRight: scale(10),
    },
    userInfo: {
      flex: 1,
    },
    name: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    userName: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    caption: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
      marginBottom: scale(12),
    },
    time: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    detailContainer: {
      marginTop: scale(20),
      borderTopWidth: scale(0.3),
      borderColor: colors.text,
      borderRadius: scale(12),
    },
    liftName: {
      fontSize: Typography.fontSize["2xl"],
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    icon: {
      width: scale(18),
      height: scale(18),
    },
    iconContainer: {
      flexDirection: "row",
      gap: scale(9),
      alignItems: "center",
      marginTop: scale(12),
    },
    count: {
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
    },
    insightContainer: {
      backgroundColor: colors.lightBlue,
      borderColor: colors.primary,
      borderWidth: scale(1),
      borderRadius: scale(12),
      paddingHorizontal: scale(12),
      paddingVertical: scale(15),
      gap: scale(4),
      marginTop: scale(15),
    },
    insightDetail: {
      fontSize: Typography.fontSize.md,
      fontWeight: Typography.fontWeight.normal,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.textSecondary,
      textAlign: "left",
    },
    insight: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.medium,
      letterSpacing: Typography.letterSpacing.normal,
      color: colors.text,
    },
    arrowBack: {
      width: scale(12),
      height: scale(12),
      marginLeft: scale(15),
    },
  });
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={handleBackPress}>
        <Image source={Images.arrowBack} style={styles.arrowBack} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image source={Images.man} style={styles.image} resizeMode="cover" />
        <View style={styles.detailContainer}>
          <View style={styles.header}>
            <Image source={Images.profile} style={styles.profile} />
            <View style={styles.userInfo}>
              <View
                style={{
                  flexDirection: "row",
                  gap: scale(7),
                  alignItems: "center",
                }}
              >
                <Text style={styles.name}>Athlete name</Text>
                <Text style={styles.time}>6m</Text>
              </View>

              <Text style={styles.userName}>@username</Text>
            </View>
          </View>
          <Text style={styles.liftName}>Power Snatch + Snatch</Text>
          <Text style={styles.caption}>
            Third complex rep out of four at 103 kg. Focused on staying smooth
            and consistent throughout the set.
          </Text>
          <View style={styles.iconContainer}>
            <Image source={Images.like} style={styles.icon} />
            <Text style={styles.count}>12</Text>
            <Image source={Images.comment} style={styles.icon} />
            <Text style={styles.count}>3</Text>
          </View>
          <View style={{ gap: scale(5), marginTop: scale(15) }}>
            <DetailLift
              icon={Images.loadicon}
              label="LOAD"
              value={120}
              unit="kg"
            />
            <Context />
            <DetailLift
              icon={Images.intenticon}
              label="intent"
              value={"Technical Inconsistency"}
            />
            <Effort />
            <DetailLift icon={Images.rpeicon} label="rpe" value={8.5} />
          </View>
          <View style={styles.insightContainer}>
            <Text style={styles.insight}>Coach's Insight</Text>
            <Text style={styles.insightDetail}>
              This was a top set late in the session, where effort naturally
              rises. Completing the lift at an RPE of 8.5 suggests the load was
              challenging without being excessive. Sets like this are often used
              to reinforce confidence before heavier singles appear in the
              program.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
