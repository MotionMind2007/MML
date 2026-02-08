import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  overlayText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTextContainer: { alignItems: 'center', marginLeft: 110 },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
    marginRight: 6,
  },
    statusText: {
    fontSize: 12,
    color: '#666',
  },
  iconButton: {
    padding: 5,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    // Shadow for Android
    elevation: 5,
    textAlign: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 220,
    paddingVertical: 10,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    fontWeight: '500',
  },
  container: { flex: 1 },
  messageList: { flex: 1, paddingHorizontal: 12 },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 5,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 1.5,
    // Shadow for Android
    elevation: 2,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3597ff', // প্রফেশনাল iOS ব্লু
    // ডানদিকের নিচের কোণা শার্প করা (Tail effect)
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 2,
    color: '#fff',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF', // পিওর হোয়াইট বাবল
    // বামদিকের নিচের কোণা শার্প করা
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 20,
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
    alignItems: 'flex-end',
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 24, // ইনপুট বক্স আরেকটু গোল
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 120,
    backgroundColor: '#F2F2F7', // ইনপুট ফিল্ডের ভেতরে হালকা গ্রে
  },
  sendButton: {
    width: 50, 
    height: 50,
    borderRadius: 25, // ৫০-এর অর্ধেক মানে একদম পারফেক্ট গোল
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    // বাটনের নিচে হালকা ছায়া
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sendText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 2, // আইকনটাকে ভিজ্যুয়ালি সেন্টারে রাখার জন্য
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    elevation: 10,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  guideText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    textAlign: 'left',
  },
  cancelButton: { backgroundColor: '#FF3B30' },
  saveButton: { backgroundColor: '#007AFF' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  messageWrapper: {
    marginVertical: 4,
    width: '100%',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    padding: 4,
    opacity: 0.8,
  },
  guideCloseButton: {
    backgroundColor: '#333', // প্রফেশনাল ডার্ক গ্রে/ব্ল্যাক রঙ
    paddingVertical: 10,
    paddingHorizontal: 30, // বাটনের উইডথ নির্দিষ্ট করার জন্য
    borderRadius: 20,
    alignItems: 'center',
    elevation: 3,
  },
});

export default styles;