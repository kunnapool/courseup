import { useCallback } from 'react';

import { Checkbox } from '@chakra-ui/checkbox';
import { Heading, HStack } from '@chakra-ui/layout';

import { useDarkMode } from 'lib/hooks/useDarkMode';

type Props = {
  subject: string;
  code: string;
  lecture?: string;
  lab?: string;
  tutorial?: string;
  handleChange: () => void;
};

export function RegistrationMinimized({ subject, code, lecture, lab, tutorial, handleChange }: Props) {
  const sections = [lecture ?? '', lab ?? '', tutorial ?? ''];
  const mode = useDarkMode();

  const onChange = useCallback(() => {
    handleChange();
  }, [handleChange]);

  return (
    <HStack justifyContent="space-between">
      <HStack>
        <Heading size="lg" as="h2" textAlign="left" my="2" mr="2">
          {subject} {code}
        </Heading>
        <Heading size="md" as="h3" color={mode('gray', 'dark.header')}>
          {sections.filter((section) => section !== '').join(', ')}
        </Heading>
      </HStack>
      <Checkbox defaultChecked onChange={onChange}>
        Registered
      </Checkbox>
    </HStack>
  );
}
