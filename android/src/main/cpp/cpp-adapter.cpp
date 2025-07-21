#include <jni.h>
#include "plugpagnitroOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::plugpagnitro::initialize(vm);
}
