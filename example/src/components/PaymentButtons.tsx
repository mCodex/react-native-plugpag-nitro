import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from './Button';
import { PAYMENT_BUTTONS } from '../utils/payment';
import { InstallmentType } from 'react-native-plugpag-nitro';

interface PaymentButtonsProps {
  isInitialized: boolean;
  isProcessing: boolean;
  hasLastPayment: boolean;
  onInitialize: () => void;
  onPayment: (options: {
    amount: number;
    type: any;
    installmentType?: InstallmentType;
    installments?: number;
  }) => void;
  onRefund: () => void;
}

export const PaymentButtons: React.FC<PaymentButtonsProps> = ({
  isInitialized,
  isProcessing,
  hasLastPayment,
  onInitialize,
  onPayment,
  onRefund,
}) => {
  const handlePaymentClick = (
    buttonConfig: (typeof PAYMENT_BUTTONS)[number]
  ) => {
    const paymentOptions = {
      amount: buttonConfig.amount,
      type: buttonConfig.paymentType,
      ...('installments' in buttonConfig && {
        installmentType: InstallmentType.BUYER_INSTALLMENT,
        installments: buttonConfig.installments,
      }),
    };
    onPayment(paymentOptions);
  };

  return (
    <View style={styles.container}>
      <Button
        title="Inicializar Terminal"
        variant={!isInitialized ? 'success' : 'primary'}
        onPress={onInitialize}
        disabled={isProcessing}
        loading={isProcessing}
      />

      {PAYMENT_BUTTONS.map((buttonConfig) => (
        <Button
          key={buttonConfig.id}
          title={buttonConfig.title}
          variant={buttonConfig.variant}
          onPress={() => handlePaymentClick(buttonConfig)}
          disabled={isProcessing || !isInitialized}
        />
      ))}

      <Button
        title="Estornar Última Transação"
        variant="warning"
        onPress={onRefund}
        disabled={isProcessing || !hasLastPayment}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
